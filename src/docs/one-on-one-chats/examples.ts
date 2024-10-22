export const oneOnOneChatExamples = {
  CreateOneOnOneChatResponse: {
    value: {
      success: true,
      message: 'Chat created successfully!',
      data: {
        id: '67162056177977602501d7d6',
        initiatorId: '66b30bbeaea1612592e8609b',
        participantId: '66c58d3c09c4603fe4b47527',
        vanishMode: false,
        createdAt: '2024-10-21T09:35:18.596Z',
        updatedAt: '2024-10-21T09:35:18.596Z',
        lastMessageAt: '2024-10-21T09:35:18.596Z',
        deletedForInitiator: null,
        deletedForParticipant: null
      }
    }
  },
  GetOneOnOneChatDetailsResponse: {
    value: {
      success: true,
      message: 'Chat details retrieved successfully!',
      data: {
        id: '67162056177977602501d7d6',
        initiatorId: '66b30bbeaea1612592e8609b',
        participantId: '66c58d3c09c4603fe4b47527',
        vanishMode: false,
        createdAt: '2024-10-21T09:35:18.596Z',
        updatedAt: '2024-10-21T09:35:18.596Z',
        lastMessageAt: '2024-10-21T09:35:18.596Z',
        deletedForInitiator: null,
        deletedForParticipant: null
      }
    }
  },
  UpdateOneOnOneChatSettingsResponse: {
    value: {
      success: true,
      message: 'Chat settings updated successfully!',
      data: null
    }
  },
  GetOneOnOneChatMessagesResponse: {
    value: {
      success: true,
      message: 'Chat messages retrieved successfully!',
      data: {
        messages: [
          {
            id: '66f3f8b0e493af07d1fe4537',
            content: 'Hi there!',
            senderId: '66b33a2d19b3564668300673',
            oneOnOneChatId: '66d6cd74e5cb752390d88fab',
            groupChatId: null,
            createdAt: '2024-09-25T11:49:04.375Z',
            updatedAt: '2024-09-25T11:55:18.398Z',
            isDeleted: false
          },
          {
            id: '66f3f4523f136de60dd42f5a',
            content: 'Hello!',
            senderId: '66b33a2d19b3564668300673',
            oneOnOneChatId: '66d6cd74e5cb752390d88fab',
            groupChatId: null,
            createdAt: '2024-09-25T11:30:26.503Z',
            updatedAt: '2024-09-25T11:55:56.196Z',
            isDeleted: false
          },
          {
            id: '66d6ce4ae5cb752390d88fac',
            content: 'How are you?',
            senderId: '66b33a2d19b3564668300673',
            oneOnOneChatId: '66d6cd74e5cb752390d88fab',
            groupChatId: null,
            createdAt: '2024-09-03T08:52:26.926Z',
            updatedAt: '2024-09-03T08:52:26.926Z',
            isDeleted: false
          }
        ],
        pagination: {
          totalCount: 3,
          hasNextPage: false,
          nextCursor: null
        }
      }
    }
  }
};
