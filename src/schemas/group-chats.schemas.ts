import * as z from 'zod';

import { objectIdRegex } from './../utils/constants';

export const objectIdSchema = z.string().regex(objectIdRegex, 'Must be a valid MongoDB ObjectId');

export const groupChatSchema = z.object({
  id: objectIdSchema.optional(),
  name: z.string().min(1, 'Group name is required'),
  groupIcon: z.string().optional(),
  groupDescription: z
    .string()
    .min(1, 'Group description must be at least 1 character long')
    .optional(),
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
  groupDescription: true,
});

export const updateGroupChatSettingsSchema = groupChatSchema
  .pick({
    name: true,
    groupDescription: true,
  })
  .partial()
  .transform((data) => ({ settings: data }));

export const addMembersToGroupChatSchema = groupChatSchema.pick({
  ownerId: true,
  memberIds: true,
});

export const removeMemberFromGroupChatSchema = groupChatSchema
  .pick({
    ownerId: true,
  })
  .extend({
    memberId: objectIdSchema,
  });
