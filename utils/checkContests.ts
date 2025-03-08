// utils/checkContests.ts
import clientPromise from '../lib/clientpromise';
import { ScoringService } from '../services/scoringService';

export async function checkEndedContests() {
  const client = await clientPromise;
  const db = client.db('tweetcontest');
  
  const endedTasks = await db.collection('tasks').find({
    endTime: { $lte: new Date() },
    isActive: true
  }).toArray();

  for (const task of endedTasks) {
    await ScoringService.determineWinners(task._id);
  }
}