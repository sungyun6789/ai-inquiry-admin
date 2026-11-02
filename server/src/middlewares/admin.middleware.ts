import type { NextFunction, Request, Response } from 'express';
import type { RowDataPacket } from 'mysql2/promise';
import { pool } from '../db/index.ts';

export async function admin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: '인증이 필요합니다.' });
  }

  const [[user]] = await pool.query<RowDataPacket[]>('select role from users where id = ?', [req.user.id]);

  if (!user) {
    return res.status(401).json({ message: '사용자를 찾을 수 없습니다.' });
  }

  if (user.role !== 'ADMIN') {
    return res.status(403).json({ message: '관리자 권한이 필요합니다.' });
  }

  next();
}
