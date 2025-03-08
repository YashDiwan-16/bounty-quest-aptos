export interface AISubmissionReview {
    score: number;
    feedback: string;
    isOriginal: boolean;
    suggestedImprovements: string[];
  }
  
  export interface AIChallengeRecommendation {
    recommendedChallenges: string[];
    difficultyLevel: string;
    reasoning: string;
  }
  
  export interface AIChallengeReview {
    isAppropriate: boolean;
    suggestedRewards: {
      min: number;
      max: number;
    };
    difficulty: string;
    tags: string[];
    improvements: string[];
  }