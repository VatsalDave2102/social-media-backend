import express from 'express';

import {
  cancelFriendRequest,
  sendFriendRequest,
  updateFriendRequest,
} from '../controllers/friend-requests.controllers';
import {
  sendFriendRequestSchema,
  updateFriendRequestSchema,
} from '../schemas/friend-requests.schemas';
import validateRequest from '../middlewares/validateRequest';
import verifyToken from '../middlewares/verifyToken';

const friendRequestsRouter = express.Router();

friendRequestsRouter.post(
  '/',
  verifyToken('accessToken'),
  validateRequest(sendFriendRequestSchema),
  sendFriendRequest,
);

friendRequestsRouter.put(
  '/:id',
  verifyToken('accessToken'),
  validateRequest(updateFriendRequestSchema),
  updateFriendRequest,
);

friendRequestsRouter.delete('/:id', verifyToken('accessToken'), cancelFriendRequest);

export default friendRequestsRouter;
