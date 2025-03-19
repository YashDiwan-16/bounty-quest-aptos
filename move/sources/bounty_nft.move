module bounty_quest::bounty_nft {
    use std::error;
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use aptos_framework::account;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::coin;
    use aptos_token::token;
    use aptos_std::aptos_hash;
    use aptos_framework::aptos_coin::AptosCoin;

    /// Error codes
    const E_INSUFFICIENT_BALANCE: u64 = 1;
    const E_COLLECTION_ALREADY_EXISTS: u64 = 2;
    const E_COLLECTION_DOES_NOT_EXIST: u64 = 3;
    const E_NO_MINT_CAPABILITY: u64 = 4;
    const E_NOT_AUTHORIZED: u64 = 5;
    const E_INVALID_REWARD_AMOUNT: u64 = 6;

    /// Collection name for Bounty Quest NFTs
    const COLLECTION_NAME: vector<u8> = b"BountyQuestWinners";
    const COLLECTION_DESCRIPTION: vector<u8> = b"NFTs awarded to winners of Bounty Quest tasks";
    const COLLECTION_URI: vector<u8> = b"https://bounty-quest-aptos.vercel.app/api/nft/collection";

    /// Events for tracking actions
    struct NFTMintedEvent has drop, store {
        token_name: String,
        token_description: String,
        token_uri: String,
        recipient: address,
        task_id: String,
    }

    struct RewardDistributedEvent has drop, store {
        recipient: address,
        amount: u64,
        task_id: String,
    }

    /// Module data structure to track events and capabilities
    struct ModuleData has key {
        collection_minted: bool,
        // Storage for event handles
        nft_mint_events: EventHandle<NFTMintedEvent>,
        reward_distribution_events: EventHandle<RewardDistributedEvent>,
    }

    /// Initialize module data for the contract
    fun init_module_data(contract_signer: &signer) {
        if (!exists<ModuleData>(signer::address_of(contract_signer))) {
            move_to(contract_signer, ModuleData {
                collection_minted: false,
                nft_mint_events: account::new_event_handle<NFTMintedEvent>(contract_signer),
                reward_distribution_events: account::new_event_handle<RewardDistributedEvent>(contract_signer),
            });
        };
    }

    /// Initialize the collection for Bounty Quest NFTs
    public entry fun initialize_collection(contract_signer: &signer) {
        let contract_addr = signer::address_of(contract_signer);
        
        // Initialize module data if not already done
        if (!exists<ModuleData>(contract_addr)) {
            init_module_data(contract_signer);
        };
        
        let module_data = borrow_global_mut<ModuleData>(contract_addr);
        
        // Check if collection is already created
        if (module_data.collection_minted) {
            abort error::already_exists(E_COLLECTION_ALREADY_EXISTS)
        };
        
        // Create the NFT collection
        token::create_collection(
            contract_signer,
            string::utf8(COLLECTION_NAME),
            string::utf8(COLLECTION_DESCRIPTION),
            string::utf8(COLLECTION_URI),
            0, // No maximum supply
            vector<bool>[false, false, false], // No mutable fields
        );
        
        // Update module data
        module_data.collection_minted = true;
    }

    /// Mint an NFT reward for a bounty winner
    public entry fun mint_winner_nft(
        contract_signer: &signer,
        recipient_addr: address,
        task_id: String,
        token_name: String,
        token_description: String,
        token_uri: String,
    ) {
        let contract_addr = signer::address_of(contract_signer);
        
        // Ensure module is initialized
        if (!exists<ModuleData>(contract_addr)) {
            init_module_data(contract_signer);
            initialize_collection(contract_signer);
        };
        
        let module_data = borrow_global_mut<ModuleData>(contract_addr);
        
        // Ensure collection exists
        if (!module_data.collection_minted) {
            abort error::not_found(E_COLLECTION_DOES_NOT_EXIST)
        };
        
        // Generate a unique token name by appending task ID
        let unique_token_name = token_name;
        
        // Create token data
        let token_data_id = token::create_tokendata(
            contract_signer,
            string::utf8(COLLECTION_NAME),
            unique_token_name,
            token_description,
            1, // Supply = 1, as this is a unique NFT
            token_uri,
            contract_addr, // Royalty payee
            0, // Royalty points denominator
            0, // Royalty points numerator
            token::create_token_mutability_config(
                &vector<bool>[false, false, false, false, false]
            ),
            vector<String>[],
            vector<vector<u8>>[],
            vector<String>[]
        );
        
        // Mint and transfer the token
        let token_id = token::mint_token(
            contract_signer,
            token_data_id,
            1, // Amount (always 1 for NFT)
        );
        
        token::direct_transfer(
            contract_signer,
            recipient_addr,
            token_id,
            1 // Amount to transfer
        );
        
        // Emit mint event
        event::emit_event<NFTMintedEvent>(
            &mut module_data.nft_mint_events,
            NFTMintedEvent {
                token_name: unique_token_name,
                token_description,
                token_uri,
                recipient: recipient_addr,
                task_id,
            }
        );
    }

    /// Distribute APT coin rewards to a bounty winner
    public entry fun distribute_apt_reward(
        contract_signer: &signer,
        recipient_addr: address,
        amount: u64,
        task_id: String
    ) {
        let contract_addr = signer::address_of(contract_signer);
        
        // Ensure module is initialized
        if (!exists<ModuleData>(contract_addr)) {
            init_module_data(contract_signer);
        };
        
        // Ensure amount is valid
        if (amount == 0) {
            abort error::invalid_argument(E_INVALID_REWARD_AMOUNT)
        };
        
        // Ensure contract has enough balance
        let balance = coin::balance<AptosCoin>(contract_addr);
        if (balance < amount) {
            abort error::resource_exhausted(E_INSUFFICIENT_BALANCE)
        };
        
        // Transfer APT to recipient
        coin::transfer<AptosCoin>(contract_signer, recipient_addr, amount);
        
        // Emit reward distribution event
        let module_data = borrow_global_mut<ModuleData>(contract_addr);
        event::emit_event<RewardDistributedEvent>(
            &mut module_data.reward_distribution_events,
            RewardDistributedEvent {
                recipient: recipient_addr,
                amount,
                task_id,
            }
        );
    }

    /// Distribute both NFT and APT rewards in a single transaction
    public entry fun distribute_complete_reward(
        contract_signer: &signer,
        recipient_addr: address,
        task_id: String,
        token_name: String,
        token_description: String,
        token_uri: String,
        apt_amount: u64
    ) {
        // Mint the NFT reward
        mint_winner_nft(
            contract_signer,
            recipient_addr,
            task_id,
            token_name,
            token_description,
            token_uri
        );
        
        // Distribute APT reward if amount is greater than 0
        if (apt_amount > 0) {
            distribute_apt_reward(
                contract_signer,
                recipient_addr,
                apt_amount,
                task_id
            );
        };
    }
} 