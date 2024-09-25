import * as z from 'zod';

import { objectIdRegex } from '../utils/constants';

const objectIdSchema = z.string().regex(objectIdRegex, 'Must be a valid MongoDB ObjectId');

export const messageSchema = z.object({
  id: objectIdSchema.optional(),
  content: z.string().min(1, 'Message content is required'),
  senderId: objectIdSchema,
  oneOnOneChatId: objectIdSchema.optional(),
  groupChatId: objectIdSchema.optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const sendMessageSchema = z
  .object({
    content: z.string().min(1, 'Message content is required'),
    senderId: objectIdSchema,
    oneOnOneChatId: objectIdSchema.optional(),
    groupChatId: objectIdSchema.optional(),
  })
  .refine(
    (data) =>
      (data.oneOnOneChatId && !data.groupChatId) || (!data.oneOnOneChatId && data.groupChatId),
    {
      message: 'Exactly one of oneOnOneChatId or groupChatId must be provided',
      path: ['oneOnOneChatId', 'groupChatId'],
    },
  );
