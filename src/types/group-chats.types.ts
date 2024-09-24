import { GroupChat } from '@prisma/client';

export type GroupChatSettings = {
  name?: GroupChat['name'];
  groupDescription?: GroupChat['groupDescription'];
};
