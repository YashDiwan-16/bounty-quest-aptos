module bounty_quest::task_rewards {
    use std::error;
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use aptos_std::table::{Self, Table};
    use aptos_framework::account;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::timestamp;

    /// Error codes
    const ERR_NOT_OWNER: u64 = 1;
    const ERR_TASK_EXISTS: u64 = 2;
    const ERR_TASK_NOT_FOUND: u64 = 3;
    const ERR_ALREADY_DISTRIBUTED: u64 = 4;
    const ERR_INVALID_DISTRIBUTION: u64 = 5;
    const ERR_INSUFFICIENT_FUNDS: u64 = 6;

    /// Task status
    const TASK_STATUS_ACTIVE: u64 = 0;
    const TASK_STATUS_COMPLETED: u64 = 1;
    const TASK_STATUS_REWARDED: u64 = 2;

    /// Represents a task in the bounty system
    struct Task has store {
        id: String,
        title: String,
        prize_pool: u64,
        status: u64,
        winners: vector<address>,
        created_at: u64,
        ended_at: u64
    }

    /// Represents a reward distribution event
    struct RewardDistributedEvent has drop, store {
        task_id: String,
        winner_address: address,
        amount: u64,
        timestamp: u64
    }

    /// Struct to store all tasks and configuration
    struct BountyQuestData has key {
        owner: address,
        tasks: Table<String, Task>,
        reward_events: EventHandle<RewardDistributedEvent>,
        owner_fee_percentage: u64, // Denominator is 100, so 20 = 20%
    }

    /// Initialize the module - can only be called once by the deployer
    public entry fun initialize(owner: &signer) {
        let owner_address = signer::address_of(owner);
        
        assert!(!exists<BountyQuestData>(owner_address), error::already_exists(ERR_TASK_EXISTS));
        
        move_to(owner, BountyQuestData {
            owner: owner_address,
            tasks: table::new(),
            reward_events: account::new_event_handle<RewardDistributedEvent>(owner),
            owner_fee_percentage: 20, // 20% fee for owner
        });
    }

    /// Create a new task with a prize pool
    public entry fun create_task(
        owner: &signer,
        task_id: String,
        title: String,
        prize_amount: u64,
        duration_secs: u64
    ) acquires BountyQuestData {
        let owner_address = signer::address_of(owner);
        
        // Only the owner can create tasks
        let bounty_data = borrow_global_mut<BountyQuestData>(owner_address);
        assert!(owner_address == bounty_data.owner, error::permission_denied(ERR_NOT_OWNER));
        
        // Check if task already exists
        assert!(!table::contains(&bounty_data.tasks, task_id), error::already_exists(ERR_TASK_EXISTS));
        
        // Create new task
        let current_time = timestamp::now_seconds();
        let task = Task {
            id: task_id,
            title,
            prize_pool: prize_amount,
            status: TASK_STATUS_ACTIVE,
            winners: vector::empty<address>(),
            created_at: current_time,
            ended_at: current_time + duration_secs
        };
        
        // Store the task
        table::add(&mut bounty_data.tasks, task.id, task);
    }

    /// Complete a task and add winners
    public entry fun complete_task(
        owner: &signer,
        task_id: String,
        winners: vector<address>
    ) acquires BountyQuestData {
        let owner_address = signer::address_of(owner);
        
        // Only the owner can complete tasks
        let bounty_data = borrow_global_mut<BountyQuestData>(owner_address);
        assert!(owner_address == bounty_data.owner, error::permission_denied(ERR_NOT_OWNER));
        
        // Check if task exists
        assert!(table::contains(&bounty_data.tasks, task_id), error::not_found(ERR_TASK_NOT_FOUND));
        
        let task = table::borrow_mut(&mut bounty_data.tasks, task_id);
        
        // Ensure task is active
        assert!(task.status == TASK_STATUS_ACTIVE, error::invalid_state(ERR_ALREADY_DISTRIBUTED));
        
        // Update task with winners and mark as completed
        task.winners = winners;
        task.status = TASK_STATUS_COMPLETED;
        task.ended_at = timestamp::now_seconds();
    }

    /// Distribute rewards to winners according to their positions
    public entry fun distribute_rewards(
        owner: &signer,
        task_id: String
    ) acquires BountyQuestData {
        let owner_address = signer::address_of(owner);
        
        // Only the owner can distribute rewards
        let bounty_data = borrow_global_mut<BountyQuestData>(owner_address);
        assert!(owner_address == bounty_data.owner, error::permission_denied(ERR_NOT_OWNER));
        
        // Check if task exists
        assert!(table::contains(&bounty_data.tasks, task_id), error::not_found(ERR_TASK_NOT_FOUND));
        
        let task = table::borrow_mut(&mut bounty_data.tasks, task_id);
        
        // Ensure task is completed but rewards not yet distributed
        assert!(task.status == TASK_STATUS_COMPLETED, error::invalid_state(ERR_INVALID_DISTRIBUTION));
        
        // Ensure we have winners
        let winners_count = vector::length(&task.winners);
        assert!(winners_count > 0, error::invalid_argument(ERR_INVALID_DISTRIBUTION));
        
        // Calculate distributions
        // First place: 40%, Second place: 25%, Third place: 15%, Owner: 20%
        let total_prize = task.prize_pool;
        let owner_amount = total_prize * bounty_data.owner_fee_percentage / 100;
        let remaining = total_prize - owner_amount;
        
        // Distribution percentages out of remaining amount
        let distribution = vector<u64>[40, 25, 15];
        let sum_distribution = 0;
        let i = 0;
        
        while (i < vector::length(&distribution)) {
            if (i < winners_count) {
                sum_distribution = sum_distribution + *vector::borrow(&distribution, i);
            };
            i = i + 1;
        };
        
        // Ensure we have funds in the contract for distribution
        assert!(
            coin::balance<AptosCoin>(owner_address) >= total_prize,
            error::insufficient_funds(ERR_INSUFFICIENT_FUNDS)
        );
        
        // Distribute to winners
        i = 0;
        let current_time = timestamp::now_seconds();
        
        while (i < winners_count && i < vector::length(&distribution)) {
            let winner_addr = *vector::borrow(&task.winners, i);
            let winner_percentage = *vector::borrow(&distribution, i);
            let winner_amount = remaining * winner_percentage / sum_distribution;
            
            // Transfer tokens to the winner
            coin::transfer<AptosCoin>(owner, winner_addr, winner_amount);
            
            // Emit event
            event::emit_event(
                &mut bounty_data.reward_events,
                RewardDistributedEvent {
                    task_id: task_id,
                    winner_address: winner_addr,
                    amount: winner_amount,
                    timestamp: current_time
                }
            );
            
            i = i + 1;
        };
        
        // Update task status
        task.status = TASK_STATUS_REWARDED;
    }

    /// Update the owner fee percentage (only owner can call)
    public entry fun update_fee_percentage(
        owner: &signer,
        new_percentage: u64
    ) acquires BountyQuestData {
        let owner_address = signer::address_of(owner);
        
        // Only the owner can update fee
        let bounty_data = borrow_global_mut<BountyQuestData>(owner_address);
        assert!(owner_address == bounty_data.owner, error::permission_denied(ERR_NOT_OWNER));
        
        // Ensure the fee is reasonable (max 50%)
        assert!(new_percentage <= 50, error::invalid_argument(ERR_INVALID_DISTRIBUTION));
        
        bounty_data.owner_fee_percentage = new_percentage;
    }
}
