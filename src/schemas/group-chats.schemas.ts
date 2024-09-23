import * as z from 'zod';

import { objectIdRegex } from './../utils/constants';

export const objectIdSchema = z.string().regex(objectIdRegex, 'Must be a valid MongoDB ObjectId');

export const groupChatSchema = z.object({
  id: objectIdSchema.optional(),
  name: z.string().min(1, 'Group name is required'),
  ownerId: objectIdSchema,
  memberIds: z.array(objectIdSchema).min(1, 'At least one member is required'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  messages: z.array(objectIdSchema).optional(),
});

export const createGroupChatSchema = groupChatSchema.pick({
  name: true,
  ownerId: true,
  memberIds: true,
});
