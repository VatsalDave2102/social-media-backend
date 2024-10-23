export const messageSchemas = {
  SendMessageRequest: {
    type: 'object',
    properties: {
      content: {
        type: 'string',
        example: ''
      },
      senderId: {
        type: 'string',
        example: ''
      },
      oneOnOneChatId: {
        type: 'string',
        example: ''
      },
      groupChatId: {
        type: 'string',
        example: ''
      }
    },
    required: ['content', 'senderId'],
    oneOf: [{ required: ['oneOnOneChatId'] }, { required: ['groupChatId'] }]
  },
  SendMessageResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      data: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          content: { type: 'string' },
          senderId: { type: 'string' },
          oneOnOneChatId: { type: 'string', nullable: true },
          groupChatId: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'Date-Time' },
          updatedAt: { type: 'string', format: 'Date-Time' },
          isDeleted: { type: 'boolean' }
        }
      }
    }
  },
  DeleteMessageResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      data: { type: 'object', nullable: 'true' }
    }
  }
};
