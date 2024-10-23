const ResponseWithoutData = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    message: { type: 'string' },
    data: { type: 'object', nullable: 'true' }
  }
};

const GroupChatResponseData = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    ownerId: { type: 'string' },
    groupDescription: { type: 'string' },
    groupIcon: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    lastMessageAt: { type: 'string', format: 'date-time' },
    memberIds: {
      type: 'array',
      items: {
        type: 'string'
      }
    }
  }
};

const MessagesArray = {
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
};

const Pagination = {
  type: 'object',
  properties: {
    totalCount: { type: 'number' },
    hasNextPage: { type: 'boolean' },
    nextCursor: { type: 'string', nullable: true }
  }
};

const MemberIdsArray = {
  type: 'array',
  items: {
    type: 'string'
  },
  description: 'IDs of the group chat members',
  example: ['']
};

export const groupChatSchemas = {
  CreateGroupChatRequest: {
    type: 'object',
    properties: {
      ownerId: { type: 'string', description: 'ID of the group chat creator/owner', example: '' },
      memberIds: MemberIdsArray,
      name: { type: 'string', description: 'Name of the group chat', example: '' },
      groupDescription: {
        type: 'string',
        description: 'Description of the group chat',
        example: ''
      },
      groupIcon: {
        type: 'string',
        description: 'Icon of the group chat',
        format: 'binary'
      }
    },
    required: ['ownerId', 'memberIds', 'name', 'groupIcon']
  },
  CreateGroupChatResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      data: GroupChatResponseData
    }
  },
  GetGroupChatDetailsResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      data: GroupChatResponseData
    }
  },
  UpdateGroupChatSettingsRequest: {
    type: 'object',
    properties: {
      settings: {
        type: 'object',
        properties: {
          name: { type: 'string', example: '' },
          groupDescription: { type: 'string', example: '' }
        }
      },
      groupIcon: { type: 'string', format: 'binary' }
    }
  },
  UpdateGroupChatSettingsResponse: ResponseWithoutData,
  GetGroupChatMessagesResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      data: {
        type: 'object',
        properties: {
          messages: MessagesArray,
          pagination: Pagination
        }
      }
    }
  },
  AddMembersToGroupChatRequest: {
    type: 'object',
    properties: {
      ownerId: { type: 'string', description: 'ID of the group chat creator/owner', example: '' },
      memberIds: MemberIdsArray
    }
  },
  AddMembersToGroupChatResponse: ResponseWithoutData,
  RemoveMemberFromGroupChatRequest: {
    type: 'object',
    properties: {
      ownerId: { type: 'string', description: 'ID of the group chat creator/owner', example: '' },
      memberId: { type: 'string', description: 'ID of the member to be deleted', example: '' }
    }
  },
  RemoveMemberFromGroupChatResponse: ResponseWithoutData
};
