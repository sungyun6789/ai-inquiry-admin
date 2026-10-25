import express, { type Request, type Response } from 'express';
import { authRouter } from './routes/auth.ts';
import { errorHandler } from './middlewares/error.middleware.ts';

const app = express();

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.use(express.json());
app.use('/auth', authRouter);
app.use(errorHandler);

app.listen(8000);
