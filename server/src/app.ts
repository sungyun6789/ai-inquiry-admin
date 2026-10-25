import express, { type Request, type Response } from 'express';
import { authRouter } from './routes/auth.ts';

const app = express();

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.use(express.json());
app.use('/auth', authRouter);

app.listen(8000);
