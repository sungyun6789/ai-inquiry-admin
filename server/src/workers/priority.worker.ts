import { Worker } from 'bullmq';
import { redis } from '../redis.ts';
import { pool, transaction } from '../db/index.ts';
import { classifyPriority } from '../utils/jev.ts';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export const priorityWorker = new Worker(
  'priority',
  async (job) => {
    const { inquiryId, userId } = job.data;
    const [[inquiry]] = await pool.query<RowDataPacket[]>(
      'select * from inquiries where id = ? and priority is null and deleted_at is null',
      [inquiryId],
    );
    if (!inquiry) return;

    const priority = await classifyPriority(inquiry.content);

    await transaction(async (conn) => {
      const [result] = await conn.query<ResultSetHeader>(
        'update inquiries set priority = ? where id = ? and priority is null and deleted_at is null',
        [priority, inquiryId],
      );
      if (result.affectedRows === 0) return;

      await conn.query('insert into inquiry_events (inquiry_id, user_id, event_type) values (?, ?, ?)', [
        inquiryId,
        userId,
        'UPDATED',
      ]);
    });
  },
  { connection: redis },
).on('failed', (job, error) => console.error(job?.id, error));
