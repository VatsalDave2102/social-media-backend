export const oneOnOneChatSchemas = {
  CreateOneOnOneChatRequest: {
    type: 'object',
    properties: {
      initiatorId: {
        type: 'string',
        description: "Initiator's ID",
        example: ''
      },
      participantId: {
        type: 'string',
        description: "Participant's ID",
        example: ''
      }
    }
  },
  CreateOneOnOneChatResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      data: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          initiatorId: { type: 'string' },
          participantId: { type: 'string' },
          vanishMode: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          lastMessageAt: { type: 'string', format: 'date-time' },
          deletedForInitiator: { type: 'boolean', nullable: true },
          deletedForParticipant: { type: 'object', nullable: true }
        }
      }
    }
  },
  GetOneOnOneChatDetailsResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      data: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          initiatorId: { type: 'string' },
          participantId: { type: 'string' },
          vanishMode: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          lastMessageAt: { type: 'string', format: 'date-time' },
          deletedForInitiator: { type: 'boolean', nullable: true },
          deletedForParticipant: { type: 'boolean', nullable: true }
        }
      }
    }
  },
  UpdateOneOnOneChatSettingsRequest: {
    type: 'object',
    properties: {
      settings: {
        type: 'object',
        properties: {
          vanishMode: { type: 'boolean', nullable: true, example: false }
        }
      }
    }
  },
  UpdateOneOnOneChatSettingsResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      data: { type: 'object', nullable: true }
    }
  },
  GetOneOnOneChatMessagesResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      data: {
        type: 'object',
        properties: {
          messages: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                content: { type: 'string' },
                senderId: { type: 'string' },
                oneOnOnechatId: { type: 'string' },
                groupChatId: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                isDeleted: { type: 'boolean' }
              }
            }
          },
          pagination: {
            type: 'object',
            properties: {
              totalCount: { type: 'number' },
              hasNextPage: { type: 'boolean' },
              nextCursor: { type: 'string', nullable: true }
            }
          }
        }
      }
    }
  }
};
