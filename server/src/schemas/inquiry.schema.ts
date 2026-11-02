import { z } from 'zod';

export const createInquirySchema = z.object({
  content: z.string().min(1),
});

export const updateInquirySchema = z
  .object({
    content: z.string().min(1).optional(),
    priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, '변경할 값을 입력해주세요.');
