import { type Request, type Response, Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.ts';
import { pool, transaction } from '../db/index.ts';
import { admin } from '../middlewares/admin.middleware.ts';
import { validate } from '../middlewares/validate.middleware.ts';
import { createInquirySchema, updateInquirySchema } from '../schemas/inquiry.schema.ts';
import { priorityQueue } from '../queues/priority.queue.ts';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export const inquiryRouter = Router();

// 문의 조회
inquiryRouter.get('/', authenticate, async (req: Request, res: Response) => {
  const [rows] = await pool.query('select * from inquiries where deleted_at is null order by priority, created_at');
  return res.json(rows);
});

// 문의 생성
inquiryRouter.post('/', authenticate, admin, validate(createInquirySchema), async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { content } = req.body;

  const insertedInquiry = await transaction(async (conn) => {
    const [result] = await conn.query<ResultSetHeader>('insert into inquiries (content, assignee_id) values(?, ?)', [
      content,
      userId,
    ]);
    await conn.query('insert into inquiry_events (inquiry_id, user_id, event_type) values (?, ?, ?)', [
      result.insertId,
      userId,
      'CREATED',
    ]);
    return { id: result.insertId };
  });

  try {
    await priorityQueue.add(
      'classify',
      { inquiryId: insertedInquiry.id, userId },
      { jobId: `priority-${insertedInquiry.id}` },
    );
  } catch (error) {
    console.error(error);
  }

  return res.status(201).json(insertedInquiry);
});

// 문의 수정
inquiryRouter.patch('/:id', authenticate, admin, validate(updateInquirySchema), async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const id = Number(req.params.id);

  const inquiry = await transaction(async (conn) => {
    const [[before]] = await conn.query<RowDataPacket[]>(
      'select * from inquiries where id = ? and deleted_at is null for update',
      [id],
    );
    if (!before) return null;

    await conn.query('update inquiries set ? where id = ?', [req.body, id]);
    await conn.query('insert into inquiry_events (inquiry_id, user_id, event_type) values (?, ?, ?)', [
      id,
      userId,
      'UPDATED',
    ]);

    const [[after]] = await conn.query<RowDataPacket[]>('select * from inquiries where id = ?', [id]);
    return after;
  });

  if (!inquiry) {
    return res.status(404).json({ message: '존재하지 않는 문의입니다.' });
  }

  return res.json(inquiry);
});

// 문의 삭제
inquiryRouter.delete('/:id', authenticate, admin, async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const id = Number(req.params.id);

  const deleted = await transaction(async (conn) => {
    const [result] = await conn.query<ResultSetHeader>(
      'update inquiries set deleted_at = now() where id = ? and deleted_at is null',
      [id],
    );

    if (result.affectedRows === 0) return false;

    await conn.query('insert into inquiry_events (inquiry_id, user_id, event_type) values (?, ?, ?)', [
      id,
      userId,
      'DELETED',
    ]);
    return true;
  });

  if (!deleted) {
    return res.status(404).json({ message: '존재하지 않는 문의입니다.' });
  }

  return res.status(204).end();
});

// 문의 분류
inquiryRouter.post('/priority', authenticate, admin, async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const [rows] = await pool.query<RowDataPacket[]>(
    'select id from inquiries where priority is null and deleted_at is null',
  );

  if (rows.length === 0) return res.json({ message: '중요도를 분류할 문의가 없습니다.' });

  await priorityQueue.addBulk(
    rows.map((r) => ({ name: 'classify', data: { inquiryId: r.id, userId }, opts: { jobId: `priority-${r.id}` } })),
  );

  return res.status(202).json({ count: rows.length });
});
