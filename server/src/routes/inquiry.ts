import { type Request, type Response, Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.ts';
import { db } from '../db/index.ts';
import { inquiries, inquiryEvents } from '../db/schema.ts';
import { eq, and, isNull } from 'drizzle-orm';
import { admin } from '../middlewares/admin.middleware.ts';
import { validate } from '../middlewares/validate.middleware.ts';
import { createInquirySchema, updateInquirySchema } from '../schemas/inquiry.schema.ts';

export const inquiryRouter = Router();

// 문의 조회
inquiryRouter.get('/', authenticate, async (req: Request, res: Response) => {
  const inquiry = await db.select().from(inquiries).where(isNull(inquiries.deletedAt));
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

  return res.status(201).json(insertedInquiry);
});

// 문의 상태 변경
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

    if (req.body.status && req.body.status !== before.status) {
      await tx.insert(inquiryEvents).values({
        inquiryId: id,
        userId,
        eventType: 'STATUS_CHANGED',
        metadata: { from: before.status, to: req.body.status },
      });
    } else {
      await tx.insert(inquiryEvents).values({ inquiryId: id, userId, eventType: 'UPDATED' });
    }

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
