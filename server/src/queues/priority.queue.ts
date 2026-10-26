import { Queue } from 'bullmq';
import { redis } from '../redis.ts';

export const priorityQueue = new Queue('priority', {
  connection: redis,
});
