import { z } from 'zod';
import { INQUIRY_PRIORITIES } from '../db/schema.ts';

export const createInquirySchema = z.object({
  content: z.string().min(1),
});

export const updateInquirySchema = z
  .object({
    content: z.string().min(1).optional(),
    priority: z.enum(INQUIRY_PRIORITIES).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, '변경할 값을 입력해주세요.');
