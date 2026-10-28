import { type Request, type Response, Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.ts';
import { db } from '../db/index.ts';
import { inquiries, inquiryEvents } from '../db/schema.ts';
import { eq, and, isNull, asc } from 'drizzle-orm';
import { admin } from '../middlewares/admin.middleware.ts';
import { validate } from '../middlewares/validate.middleware.ts';
import { createInquirySchema, updateInquirySchema } from '../schemas/inquiry.schema.ts';
import { priorityQueue } from '../queues/priority.queue.ts';

export const inquiryRouter = Router();

// 문의 조회
inquiryRouter.get('/', authenticate, async (req: Request, res: Response) => {
  const inquiry = await db
    .select()
    .from(inquiries)
    .where(isNull(inquiries.deletedAt))
    .orderBy(asc(inquiries.priority), asc(inquiries.createdAt));
  return res.json(inquiry);
});

// 문의 생성
inquiryRouter.post('/', authenticate, admin, validate(createInquirySchema), async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { content } = req.body;

  const insertedInquiry = await db.transaction(async (tx) => {
    const [inserted] = await tx.insert(inquiries).values({ content, assigneeId: userId }).$returningId();
    await tx.insert(inquiryEvents).values({ inquiryId: inserted.id, userId, eventType: 'CREATED' });
    return inserted;
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

  const inquiry = await db.transaction(async (tx) => {
    const [before] = await tx
      .select()
      .from(inquiries)
      .where(and(eq(inquiries.id, id), isNull(inquiries.deletedAt)))
      .for('update');
    if (!before) return null;

    await tx.update(inquiries).set(req.body).where(eq(inquiries.id, id));
    await tx.insert(inquiryEvents).values({ inquiryId: id, userId, eventType: 'UPDATED' });

    const [after] = await tx.select().from(inquiries).where(eq(inquiries.id, id));
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

  const deleted = await db.transaction(async (tx) => {
    const [result] = await tx
      .update(inquiries)
      .set({ deletedAt: new Date() })
      .where(and(eq(inquiries.id, id), isNull(inquiries.deletedAt)));

    if (result.affectedRows === 0) return false;

    await tx.insert(inquiryEvents).values({ inquiryId: id, userId, eventType: 'DELETED' });
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

  const rows = await db
    .select({ id: inquiries.id })
    .from(inquiries)
    .where(and(isNull(inquiries.priority), isNull(inquiries.deletedAt)));

  if (rows.length === 0) return res.json({ message: '중요도를 분류할 문의가 없습니다.' });

  await priorityQueue.addBulk(
    rows.map((r) => ({ name: 'classify', data: { inquiryId: r.id, userId }, opts: { jobId: `priority-${r.id}` } })),
  );

  return res.status(202).json({ count: rows.length });
});
