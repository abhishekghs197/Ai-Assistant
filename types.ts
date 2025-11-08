// FIX: Removed circular dependency where the file was importing the 'Message' type from itself.

export enum MessageSender {
  USER = 'user',
  AI = 'ai',
}

export interface Message {
  id: string;
  text: string;
  sender: MessageSender;
  timestamp: string;
  file?: {
    type: string;
    data: string;
    name: string;
  };
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  headerImage?: string;
}

export interface User {
  username: string;
  password?: string; // Optional for security on client-side
}