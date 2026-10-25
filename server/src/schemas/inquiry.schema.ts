import { z } from 'zod';
import { INQUIRY_PRIORITIES, INQUIRY_STATUSES } from '../db/schema.ts';

export const createInquirySchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
});

export const updateInquirySchema = z
  .object({
    title: z.string().min(1).max(255).optional(),
    content: z.string().min(1).optional(),
    status: z.enum(INQUIRY_STATUSES).optional(),
    priority: z.enum(INQUIRY_PRIORITIES).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, '변경할 값을 입력해주세요.');
