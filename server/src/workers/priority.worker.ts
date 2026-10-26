import { Worker } from 'bullmq';
import { redis } from '../redis.ts';
import { and, eq, isNull } from 'drizzle-orm';
import { inquiries, inquiryEvents } from '../db/schema.ts';
import { db } from '../db/index.ts';
import { classifyPriority } from '../utils/jev.ts';

export const priorityWorker = new Worker(
  'priority',
  async (job) => {
    const { inquiryId, userId } = job.data;
    const target = and(eq(inquiries.id, inquiryId), isNull(inquiries.priority), isNull(inquiries.deletedAt));
    const [inquiry] = await db.select().from(inquiries).where(target);
    if (!inquiry) return;

    const priority = await classifyPriority(inquiry.content);

    await db.transaction(async (tx) => {
      const [result] = await tx.update(inquiries).set({ priority }).where(target);
      if (result.affectedRows === 0) return;

      await tx.insert(inquiryEvents).values({ inquiryId, userId, eventType: 'UPDATED' });
    });
  },
  { connection: redis },
).on('failed', (job, error) => console.error(job?.id, error));
