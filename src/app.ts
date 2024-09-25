import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRouter from './routes/auth.routes';
import { errorConverter } from './middlewares/errorConverter';
import { errorHandler } from './middlewares/errorHandler';
import logger from './utils/logger';
import messagesRouter from './routes/messages.routes';

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.get('/', (req, res) => {
  logger.info('Home route accessed');
  res.json({ message: 'Welcome to the API' });
});

// Auth Routes
app.use('/api/v1/auth', authRouter);

// Message Routes 
app.use('/api/v1/messages', messagesRouter);

app.use(errorConverter);
app.use(errorHandler);

export default app;
