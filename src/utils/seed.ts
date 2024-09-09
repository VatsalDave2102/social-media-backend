import { FriendRequestStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';

import prisma from '../config/db';

// script to generate fake data
async function main() {
  const users = [];
  const friendRequests = [];
  const oneOnOneChats = [];
  const groupChats = [];
  const messages = [];

  // Generate Users
  for (let i = 0; i < 10; i++) {
    users.push({
      email: faker.internet.email(),
      password: faker.internet.password(),
      name: faker.person.fullName(),
      bio: faker.lorem.sentence(),
      profilePicture: faker.image.avatar(),
    });
  }

  await prisma.user.createMany({
    data: users,
  });

  const userIds = await prisma.user.findMany({
    select: { id: true },
  });

  // Generate Friend Requests
  for (const user of userIds) {
    for (let i = 0; i < 3; i++) {
      const friendRequest = {
        senderId: user.id,
        receiverId: userIds[(i + 1) % userIds.length].id,
        status: FriendRequestStatus.PENDING,
      };
      friendRequests.push(friendRequest);
    }
  }

  await prisma.friendRequest.createMany({
    data: friendRequests,
  });

  // Generate One-On-One Chats
  for (const user of userIds) {
    for (let i = 0; i < 2; i++) {
      const oneOnOneChat = {
        initiatorId: user.id,
        participantId: userIds[(i + 1) % userIds.length].id,
      };
      oneOnOneChats.push(oneOnOneChat);
    }
  }

  await prisma.oneOnOneChat.createMany({
    data: oneOnOneChats,
  });

  const oneOnOneChatIds = await prisma.oneOnOneChat.findMany({
    select: { id: true },
  });

  // Generate Group Chats
  for (let i = 0; i < 2; i++) {
    const groupChat = {
      name: faker.lorem.words(),
      ownerId: userIds[i].id,
      memberIds: userIds.map((user) => user.id),
    };
    groupChats.push(groupChat);
  }

  await prisma.groupChat.createMany({
    data: groupChats,
  });

  const groupChatIds = await prisma.groupChat.findMany({
    select: { id: true },
  });

  // Generate Messages
  for (const user of userIds) {
    for (let i = 0; i < 50; i++) {
      const oneOnOneChatMessage = {
        content: faker.lorem.sentence(),
        senderId: user.id,
        oneOnOneChatId: oneOnOneChatIds[i % oneOnOneChatIds.length].id,
      };
      const groupChatMessage = {
        content: faker.lorem.sentence(),
        senderId: user.id,
        groupChatId: groupChatIds[i % groupChatIds.length].id,
      };
      messages.push(oneOnOneChatMessage, groupChatMessage);
    }
  }

  await prisma.message.createMany({
    data: messages,
  });

  console.log('Data seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
