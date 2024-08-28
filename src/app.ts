import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import logger from './utils/logger';
import { errorHandler } from './middlewares/errorHandler';
import authRouter from './routes/auth.routes';
import cookieParser from 'cookie-parser';

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

app.use(errorHandler);

export default app;
