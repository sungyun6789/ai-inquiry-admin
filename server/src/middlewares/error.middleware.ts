import type { NextFunction, Request, Response } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    return next(err);
  }

  if (err.status && err.status < 500) {
    return res.status(err.status).json({ message: '잘못된 요청입니다.' });
  }

  console.error(err);
  return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
}
