import * as z from 'zod';
import { objectIdRegex } from '../utils/constants';

const objectIdSchema = z.string().regex(objectIdRegex, 'ID must be a valid MongoDB ObjectId');

export const oneOnOneChatSchema = z.object({
  id: objectIdSchema.optional(),
  initiatorId: objectIdSchema,
  participantId: objectIdSchema,
  vanishMode: z.boolean().default(false),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  lastMessageAt: z.date().optional(),
  deletedForInitiator: z.date().nullable().optional(),
  deletedForParticipant: z.date().nullable().optional(),
  messages: z.array(objectIdSchema).optional(),
});

export const createOneOnOneChatSchema = oneOnOneChatSchema
  .pick({
    initiatorId: true,
    participantId: true,
  })
  .refine((data) => data.initiatorId !== data.participantId, {
    message: 'Initiator and participant cannot be the same user',
    path: ['initiatorId'],
  });