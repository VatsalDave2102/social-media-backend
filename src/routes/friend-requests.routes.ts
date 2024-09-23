import express from 'express';
import { sendFriendRequest } from '../controllers/friend-requests.controllers';
import { sendFriendRequestSchema } from '../schemas/friend-requests.schemas';
import validateRequest from '../middlewares/validateRequest';
import verifyToken from '../middlewares/verifyToken';

const friendRequestsRouter = express.Router();

friendRequestsRouter.post(
  '/',
  verifyToken('accessToken'),
  validateRequest(sendFriendRequestSchema),
  sendFriendRequest,
);

export default friendRequestsRouter;
