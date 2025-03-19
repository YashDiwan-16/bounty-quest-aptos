import { AptosConfig, Network, Aptos } from "@aptos-labs/ts-sdk";
import { AgentRuntime, LocalSigner } from "@meta-move/move-agent-kit";
import { Ed25519PrivateKey, PrivateKey, PrivateKeyVariants } from "@aptos-labs/ts-sdk";
import { ChatAnthropic } from "@langchain/anthropic";
import { createAptosTools } from "@meta-move/move-agent-kit";
import clientPromise from "@/lib/clientpromise";
import { ObjectId } from "mongodb";

export class BlockchainRewardService {
  private static agent: AgentRuntime;
  private static aptos: Aptos;
  private static isInitialized = false;

  /**
   * Initialize the Aptos agent with the necessary configurations.
   * This should be called before using any of the reward methods.
   */
  public static async initialize() {
    if (this.isInitialized) return;

    // Initialize Aptos configuration
    const aptosConfig = new AptosConfig({
      network: process.env.APTOS_NETWORK === "mainnet" ? Network.MAINNET : Network.TESTNET,
    });

    this.aptos = new Aptos(aptosConfig);

    // Derive account from private key
    const account = await this.aptos.deriveAccountFromPrivateKey({
      privateKey: new Ed25519PrivateKey(
        PrivateKey.formatPrivateKey(
          process.env.APTOS_PRIVATE_KEY!,
          PrivateKeyVariants.Ed25519,
        ),
      ),
    });

    // Initialize signer and agent
    const signer = new LocalSigner(account, 
      process.env.APTOS_NETWORK === "mainnet" ? Network.MAINNET : Network.TESTNET
    );
    
    this.agent = new AgentRuntime(signer, this.aptos, {
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY
    });

    this.isInitialized = true;
  }

  /**
   * Mints an NFT for the winner of a task.
   * 
   * @param recipientAddress The Aptos wallet address of the winner
   * @param taskId The ID of the task
   * @param taskDetails Task details to be used as metadata for the NFT
   * @returns Transaction hash of the minted NFT
   */
  public static async mintNFTForWinner(
    recipientAddress: string,
    taskId: string,
    taskDetails: any
  ): Promise<string> {
    if (!this.isInitialized) await this.initialize();

    try {
      // Create NFT metadata
      const metadata = {
        name: `Bounty Quest Winner: ${taskDetails.title || 'Task #' + taskId}`,
        description: `Awarded for completing the task: ${taskDetails.description}`,
        uri: `https://bounty-quest-aptos.vercel.app/api/nft/metadata/${taskId}`,
        properties: {
          taskId,
          category: taskDetails.category,
          completedOn: new Date().toISOString(),
          achievementType: "Bounty Winner"
        }
      };

      // Create NFT collection if it doesn't exist
      const collectionName = "BountyQuestWinners";
      const collectionDescription = "NFTs awarded to winners of Bounty Quest tasks";
      
      // Use the agent to execute the collection creation transaction (if needed)
      // Note: In practice, you'd want to check if the collection exists first
      const llm = new ChatAnthropic({
        temperature: 0.2,
        model: "claude-3-5-sonnet-20241022",
        anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      });

      // Use AI agent to create an NFT
      const createNFTPrompt = `
        I need to mint an NFT on Aptos for a bounty winner.
        
        Recipient address: ${recipientAddress}
        Collection name: ${collectionName}
        NFT name: ${metadata.name}
        Description: ${metadata.description}
        URI: ${metadata.uri}
        
        Please mint this NFT and transfer it to the recipient.
      `;

      // Execute the NFT minting transaction
      const txHash = await this.agent.executeTransaction(createNFTPrompt);
      
      // Record the transaction in the database
      await this.recordRewardTransaction(taskId, recipientAddress, 'nft', txHash);
      
      return txHash;
    } catch (error) {
      console.error('Error minting NFT:', error);
      throw error;
    }
  }

  /**
   * Transfers APT coins to the winner as an additional reward.
   * 
   * @param recipientAddress The Aptos wallet address of the winner
   * @param taskId The ID of the task
   * @param amount The amount of APT to transfer
   * @returns Transaction hash of the transfer
   */
  public static async transferAPTReward(
    recipientAddress: string,
    taskId: string,
    amount: number
  ): Promise<string> {
    if (!this.isInitialized) await this.initialize();

    try {
      // Transfer APT to the winner
      const txHash = await this.agent.transferTokens(recipientAddress, amount);
      
      // Record the transaction in the database
      await this.recordRewardTransaction(taskId, recipientAddress, 'apt', txHash, amount);
      
      return txHash;
    } catch (error) {
      console.error('Error transferring APT:', error);
      throw error;
    }
  }

  /**
   * Records a blockchain transaction in the database.
   * 
   * @param taskId The ID of the task
   * @param recipientAddress The recipient address
   * @param rewardType Type of reward ('nft' or 'apt')
   * @param txHash Transaction hash
   * @param amount Amount of APT (for APT rewards only)
   */
  private static async recordRewardTransaction(
    taskId: string,
    recipientAddress: string,
    rewardType: 'nft' | 'apt',
    txHash: string,
    amount?: number
  ): Promise<void> {
    try {
      const client = await clientPromise;
      const db = client.db("tweetcontest");
      
      await db.collection("rewards").insertOne({
        taskId,
        recipientAddress,
        rewardType,
        txHash,
        amount: amount || 0,
        timestamp: new Date(),
        status: 'completed'
      });
      
      // Update the task with reward information
      await db.collection("tasks").updateOne(
        { _id: new ObjectId(taskId) },
        { 
          $set: { 
            rewardDistributed: true,
            rewardDistributedAt: new Date()
          },
          $push: {
            rewards: {
              recipientAddress,
              rewardType,
              txHash,
              amount: amount || 0,
              timestamp: new Date()
            }
          }
        }
      );
    } catch (error) {
      console.error('Error recording transaction:', error);
      throw error;
    }
  }

  /**
   * Distributes all rewards (NFT and APT) to the winner.
   * 
   * @param recipientAddress The Aptos wallet address of the winner
   * @param taskId The ID of the task
   * @param aptAmount The amount of APT to transfer
   * @returns Object containing transaction hashes
   */
  public static async distributeRewards(
    recipientAddress: string,
    taskId: string,
    aptAmount: number = 1.0
  ): Promise<{ nftTxHash: string, aptTxHash: string }> {
    if (!this.isInitialized) await this.initialize();

    try {
      // Get task details for NFT metadata
      const client = await clientPromise;
      const db = client.db("tweetcontest");
      const taskDetails = await db.collection("tasks").findOne({ _id: new ObjectId(taskId) });
      
      if (!taskDetails) {
        throw new Error(`Task with ID ${taskId} not found`);
      }
      
      // Mint NFT for winner
      const nftTxHash = await this.mintNFTForWinner(
        recipientAddress,
        taskId,
        taskDetails
      );
      
      // Transfer APT to winner
      const aptTxHash = await this.transferAPTReward(
        recipientAddress,
        taskId,
        aptAmount
      );
      
      return {
        nftTxHash,
        aptTxHash
      };
    } catch (error) {
      console.error('Error distributing rewards:', error);
      throw error;
    }
  }
} 