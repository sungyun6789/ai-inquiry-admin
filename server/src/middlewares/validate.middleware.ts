import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';

export function validate(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ message: '잘못된 요청입니다.', errors: result.error.issues });
    }

    req.body = result.data;
    next();
  };
}
