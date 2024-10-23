export const friendRequestsSchemas = {
  SendFriendRequestRequest: {
    type: 'object',
    properties: {
      senderId: {
        type: 'string',
        description: "Sender's ID",
        example: ''
      },
      receiverId: {
        type: 'string',
        description: "Receiver's ID",
        example: ''
      }
    }
  },
  SendFriendRequestResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      data: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          senderId: { type: 'string' },
          receiverId: { type: 'string' },
          status: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  },
  UpdateFriendRequestRequest: {
    type: 'object',
    properties: {
      status: { type: 'string', enum: ['ACCEPTED', 'REJECTED'] }
    }
  },
  AcceptedFriendRequestResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      data: { type: 'object', nullable: true }
    }
  },
  RejectedFriendRequestResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      data: { type: 'object', nullable: true }
    }
  },
  CancelFriendRequestResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      data: { type: 'object', nullable: true }
    }
  }
};
