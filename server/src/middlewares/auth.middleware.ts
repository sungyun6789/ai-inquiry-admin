import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;
  const [scheme, token] = authorization?.split(' ') ?? [];

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
  }

  try {
    const secret = process.env.JWT_SECRET!;
    const payload = jwt.verify(token, secret);
    const id = Number(payload.sub);

    if (typeof payload === 'string' || !payload.sub || !Number.isSafeInteger(id) || id <= 0) {
      return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
    }

    req.user = { id };
    next();
  } catch (error) {
    return res.status(401).json({ message: '토큰이 유효하지 않거나 만료되었습니다.' });
  }
}
