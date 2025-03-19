# NFT and APT Rewards for Bounty Quest

This README provides guidance on setting up and using the NFT and APT reward distribution feature for your Bounty Quest project. The implementation uses the Move AI Agent Kit to interact with Aptos blockchain.

## Overview

The NFT and APT reward system allows the AI agent to:
1. Select a winner for a bounty task
2. Mint a unique NFT as a reward
3. Distribute APT coins as an additional reward
4. Record all transactions on the blockchain

## Prerequisites

- Node.js 16+
- Aptos CLI
- An Aptos wallet with APT tokens for gas and rewards

## Installation

1. Install the necessary npm packages:

```bash
npm install @aptos-labs/ts-sdk @meta-move/move-agent-kit @langchain/anthropic
```

2. Add the required environment variables to your `.env` file:

```
APTOS_PRIVATE_KEY="your_private_key"
APTOS_NETWORK="testnet" # or "mainnet"
ANTHROPIC_API_KEY="your_anthropic_api_key"
OPENAI_API_KEY="your_openai_api_key" # optional
```

## Smart Contract Deployment

1. Navigate to the `move` directory:

```bash
cd /path/to/bounty-quest-aptos/move
```

2. Configure your sender address in the Move.toml file:

```bash
# Replace YOUR_ADDRESS with your account address
aptos move create-resource-account-and-publish-package --address-name bounty_quest --seed 0 --profile your-profile
```

3. Compile and publish the smart contract:

```bash
aptos move compile
aptos move publish --named-addresses bounty_quest=YOUR_ACCOUNT_ADDRESS
```

4. Initialize the NFT collection:

```bash
aptos move run --function-id YOUR_ACCOUNT_ADDRESS::bounty_nft::initialize_collection
```

## Integration with AI Agent

The system is built with the following components:

1. **BlockchainRewardService** - A service class that handles interactions with the Aptos blockchain
2. **Move Smart Contract** - A Move contract that implements NFT minting and APT distribution
3. **API Endpoints** - RESTful endpoints for triggering reward distribution

## How It Works

### 1. Winner Selection

The existing evaluation system selects a winner based on predefined criteria:

```typescript
// In ScoringService
public static async determineWinners(taskId: object): Promise<void> {
  const client = await clientPromise;
  const db = client.db("tweetcontest");

  // Get top 3 entries based on total score
  const entries = await db
    .collection("entries")
    .find({ taskId })
    .sort({ totalScore: -1 })
    .limit(3)
    .toArray();

  // Update task with winners
  await db.collection("tasks").updateOne(
    { _id: taskId },
    {
      $set: {
        winners: entries.map(entry => entry.author),
        isActive: false,
      },
    }
  );
}
```

### 2. Reward Distribution

Once a winner is selected, you can distribute rewards through the API:

```typescript
// Example usage with fetch
const response = await fetch('/api/tasks/reward', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
  },
  body: JSON.stringify({
    taskId: '123456789',
    winnerWallet: '0x1234...', // Winner's Aptos wallet address
    aptAmount: 1.5 // Amount of APT to distribute
  })
});

const result = await response.json();
```

### 3. Blockchain Interaction

The BlockchainRewardService uses the Move AI Agent Kit to interact with the Aptos blockchain:

```typescript
// Initialize the Aptos agent
const aptosConfig = new AptosConfig({
  network: Network.TESTNET, // or MAINNET
});

const aptos = new Aptos(aptosConfig);
const account = await aptos.deriveAccountFromPrivateKey({
  privateKey: new Ed25519PrivateKey(
    PrivateKey.formatPrivateKey(process.env.APTOS_PRIVATE_KEY!, PrivateKeyVariants.Ed25519)
  ),
});

const signer = new LocalSigner(account, Network.TESTNET);
const agent = new AgentRuntime(signer, aptos, {
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY
});

// Mint NFT and distribute APT
const nftTxHash = await agent.mintNFT(winnerAddress, metadata);
const aptTxHash = await agent.transferTokens(winnerAddress, aptAmount);
```

## Testing and Verification

### Local Testing

1. Start a local Aptos node:

```bash
aptos node run-local-testnet --with-faucet
```

2. Deploy the smart contract to the local testnet
3. Test reward distribution with the API endpoint

### Testnet Testing

1. Deploy the smart contract to Testnet
2. Fund your account with Testnet APT from the faucet
3. Test reward distribution with real wallet addresses

### Verifying Transactions

1. Check transaction status on Aptos Explorer:
   - NFT Mint: `https://explorer.aptoslabs.com/txn/{nftTxHash}`
   - APT Transfer: `https://explorer.aptoslabs.com/txn/{aptTxHash}`

2. Verify NFT in recipient wallet:
   - `https://explorer.aptoslabs.com/account/{recipient_address}/coins`

## Customization

### NFT Metadata

You can customize the NFT metadata in the `BlockchainRewardService.mintNFTForWinner` method:

```typescript
const metadata = {
  name: `Custom Name - ${taskDetails.title}`,
  description: `Custom description for task: ${taskDetails.description}`,
  uri: `https://your-custom-metadata-uri.com/${taskId}`,
  properties: {
    // Custom properties
  }
};
```

### Reward Amounts

You can customize the APT amount in the API call or in the `TaskGeneratorService.createNewTask` method:

```typescript
const task = await this.generateTaskWithAI();

// Add custom reward amount
task.rewards = {
  aptAmount: 2.5,
  nftReward: true
};
```

## Troubleshooting

### Common Issues

1. **Insufficient Balance**: Ensure your account has enough APT for rewards and gas fees
2. **Transaction Failures**: Check gas settings and network status
3. **API Authorization**: Verify API key configuration

### Error Handling

The service includes detailed error handling:

```typescript
try {
  // Distribute rewards
  const rewardResult = await BlockchainRewardService.distributeRewards(
    winnerWallet,
    taskId,
    aptAmount
  );
  
  // Return success
  return NextResponse.json({
    message: "Rewards distributed successfully",
    nftTxHash: rewardResult.nftTxHash,
    aptTxHash: rewardResult.aptTxHash
  });
} catch (error) {
  console.error("Error distributing rewards:", error);
  return NextResponse.json(
    { error: "Failed to distribute rewards", message: error.message },
    { status: 500 }
  );
}
```

## Best Practices

1. **Security**: Keep private keys secure and never expose them in client-side code
2. **Gas Efficiency**: Optimize smart contracts for minimal gas usage
3. **Error Handling**: Implement comprehensive error handling and logging
4. **Testing**: Test extensively on testnet before moving to mainnet
5. **Monitoring**: Set up monitoring for failed transactions

## Resources

- [Aptos Documentation](https://aptos.dev/)
- [Move AI Agent Kit Documentation](https://metamove.build/move-agent-kit)
- [Aptos Token Standard](https://aptos.dev/standards/aptos-token/)
- [Bounty Quest Project](https://github.com/yourusername/bounty-quest-aptos) 