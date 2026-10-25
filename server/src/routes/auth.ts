import { Router, type Request, type Response } from 'express';
import { validate } from '../middlewares/validate.middleware.ts';
import { loginSchema } from '../schemas/auth.schema.ts';
import { db } from '../db/index.ts';
import { users } from '../db/schema.ts';
import { eq } from 'drizzle-orm';
import { password } from '../utils/password.ts';
import jwt from 'jsonwebtoken';
import { authenticate } from '../middlewares/auth.middleware.ts';

export const authRouter = Router();

// 로그인
authRouter.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password: plainPassword } = req.body;
    // 사용자 조회
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    // 비밀번호 검증
    const vaildPassword = await password.compare(plainPassword, user.password);
    if (!vaildPassword) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    // 토큰 발급
    const secret = process.env.JWT_SECRET!;
    const accessToken = jwt.sign({ role: user.role }, secret, {
      subject: String(user.id),
      expiresIn: '1h',
    });
    return res.json({ accessToken, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 유저 정보 조회
authRouter.get('/user', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      return res.status(404).json({ message: '존재하지 않는 사용자입니다.' });
    }
    return res.json({ id: user.id, email: user.email, role: user.role });
  } catch (error) {
    return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});
