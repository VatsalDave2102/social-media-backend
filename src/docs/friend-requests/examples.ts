export const friendRequestExamples = {
  SendFriendRequestResponse: {
    value: {
      success: true,
      message: 'Friend request sent successfully',
      data: {
        friendRequest: {
          id: '67188890a6b849e1342c0f74',
          senderId: '66b33a2d19b3564668300673',
          receiverId: '66ac8081d35c80d020768a2b',
          status: 'PENDING',
          createdAt: '2024-10-23T05:24:32.774Z',
          updatedAt: '2024-10-23T05:24:32.774Z'
        }
      }
    }
  },
  AcceptedFriendRequestResponse: {
    value: {
      success: true,
      message: 'Friend request accepted successfully',
      data: null
    }
  },
  RejectedFriendRequestResponse: {
    value: {
      success: true,
      message: 'Friend request rejected successfully',
      data: null
    }
  },
  CancelFriendRequestResponse: {
    value: {
      success: true,
      message: 'Friend request cancelled successfully',
      data: null
    }
  }
};
