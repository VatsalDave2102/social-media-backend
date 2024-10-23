export const groupChatExamples = {
  CreateGroupChatResponse: {
    success: true,
    message: 'Group chat created successfully!',
    data: {
      id: '671764c1c24a444d00123456',
      name: 'New Group Chat',
      ownerId: '66b33a2d19b3564668356789',
      groupDescription: 'Welcome to our new group chat!',
      groupIcon:
        'https://res.cloudinary.com/du9x9e2oh/image/upload/v1729586123/group_icons/mkymgovdvgfv8ls2.jpg',
      createdAt: '2024-10-22T08:39:29.733Z',
      updatedAt: '2024-10-22T08:39:29.733Z',
      lastMessageAt: '2024-10-22T08:39:29.733Z',
      memberIds: ['66b30bbeaea1612592e7501a', '671764c1c24a444d00123456']
    }
  },
  GetGroupChatDetailsResponse: {
    success: true,
    message: 'Chat details retrieved successfully!',
    data: {
      id: '671764c1c24a444d00123456',
      name: 'New Group Chat',
      ownerId: '66b33a2d19b3564668356789',
      groupDescription: 'Welcome to our new group chat!',
      groupIcon:
        'https://res.cloudinary.com/du9x9e2oh/image/upload/v1729586123/group_icons/mkymgovdvgfv8ls2.jpg',
      createdAt: '2024-10-22T08:39:29.733Z',
      updatedAt: '2024-10-22T08:39:29.733Z',
      lastMessageAt: '2024-10-22T08:39:29.733Z',
      memberIds: ['66b30bbeaea1612592e7501a', '671764c1c24a444d00123456']
    }
  },
  UpdateGroupChatSettingsResponse: {
    success: true,
    message: 'Chat settings updated successfully!',
    data: null
  },
  GetGroupChatMessagesResponse: {
    success: true,
    message: 'Chat messages retrieved successfully!',
    data: {
      messages: [
        {
          id: '66f3ec5c0390fdcf34ce778d',
          content: 'New Message 4',
          senderId: '66b33a2d19b3564668398765',
          oneOnOneChatId: null,
          groupChatId: '66f15453eda9647f5be80ab7',
          createdAt: '2024-09-25T10:56:28.374Z',
          updatedAt: '2024-09-25T10:56:28.374Z',
          isDeleted: false
        },
        {
          id: '66f3e78489bb1b6a4f79cf7c',
          content: 'New Message 3',
          senderId: '66b33a2d19b3564668356789',
          oneOnOneChatId: null,
          groupChatId: '66f15453eda9647f5be80ab7',
          createdAt: '2024-09-25T10:35:48.140Z',
          updatedAt: '2024-09-25T10:35:48.140Z',
          isDeleted: false
        },
        {
          id: '66f3e5f689bb1b6a4f79cf7b',
          content: 'New Message 2',
          senderId: '66b33a2d19b3564668398765',
          oneOnOneChatId: null,
          groupChatId: '66f15453eda9647f5be80ab7',
          createdAt: '2024-09-25T10:29:10.240Z',
          updatedAt: '2024-09-25T10:29:10.240Z',
          isDeleted: false
        },
        {
          id: '66f3d4aee4e5768ce4fc250a',
          content: 'New Message 1',
          senderId: '66b33a2d19b3564668356789',
          oneOnOneChatId: null,
          groupChatId: '66f15453eda9647f5be80ab7',
          createdAt: '2024-09-25T09:15:26.451Z',
          updatedAt: '2024-09-25T09:15:26.451Z',
          isDeleted: false
        }
      ],
      pagination: {
        totalCount: 4,
        hasNextPage: false,
        nextCursor: null
      }
    }
  },
  AddMembersToGroupChatResponse: {
    success: true,
    message: 'Members added successfully!',
    data: null
  },
  RemoveMemberFromGroupChatResponse: {
    success: true,
    message: 'Member removed successfully!',
    data: null
  }
};
