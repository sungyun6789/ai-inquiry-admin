import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
});
