import * as z from 'zod';
import { objectIdRegex } from '../utils/constants';

const objectIdSchema = z.string().regex(objectIdRegex, 'ID must be a valid MongoDB ObjectId');

const friendRequestSchema = z.object({
  id: objectIdSchema.optional(),
  senderId: objectIdSchema,
  receiverId: objectIdSchema,
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED']),
});

export const sendFriendRequestSchema = friendRequestSchema
  .pick({
    senderId: true,
    receiverId: true,
  })
  .refine((data) => data.receiverId !== data.senderId, {
    message: 'Cannot send a friend request to yourself',
    path: ['senderId'],
  });

export const updateFriendRequestSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED']),
});
