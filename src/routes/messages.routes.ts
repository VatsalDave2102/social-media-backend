import express from 'express';

import { sendMessage } from '../controllers/messages.controllers';
import { sendMessageSchema } from '../schemas/messages.schemas';
import validateRequest from '../middlewares/validateRequest';
import verifyToken from '../middlewares/verifyToken';

const messagesRouter = express.Router();

messagesRouter.post(
  '/send',
  validateRequest(sendMessageSchema),
  verifyToken('accessToken'),
  sendMessage,
);

export default messagesRouter;