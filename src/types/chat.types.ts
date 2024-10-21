// Represents a cursor for a chat, containing the timestamp of the last message and a unique identifier.
export interface ChatCursor {
  lastMessageAt: Date;
  id: string;
}
