export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: "meme" | "educational" | "development";
  difficulty: "beginner" | "intermediate" | "advanced";
  rewards: {
    usdcAmount: number;
    nftReward?: string;
  };
  deadline: Date;
  requirements: string[];
  creator: string;
  participants: string[];
  submissions: Submission[];
  status: "active" | "completed" | "expired";
}

export interface Submission {
  id: string;
  challengeId: string;
  creator: string;
  content: {
    ipfsHash: string;
    arweaveHash?: string;
  };
  timestamp: Date;
  status: "pending" | "approved" | "rejected";
  aiScore?: number;
  feedback?: string;
}

export interface Task {
  _id: string;
  description: string;
  category: "blockchain" | "memes" | "nfts";
  requirements: string[];
  evaluationCriteria: string[];
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  winners: string[];
  title: string;
  isWinnerDeclared: boolean;
  rewards: {
    usdcAmount: number;
    nftReward?: string;
  };
}
