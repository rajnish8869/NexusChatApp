
export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  LOCATION = 'location',
  CONTACT = 'contact',
  SYSTEM = 'system'
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed'
}

export interface UserSettings {
  privacy: {
    lastSeen: 'everyone' | 'contacts' | 'nobody';
    profilePhoto: 'everyone' | 'contacts' | 'nobody';
    readReceipts: boolean;
  };
  notifications: {
    sound: boolean;
    vibration: boolean;
    preview: boolean;
  };
  theme: 'light' | 'dark' | 'system';
  wallpaper: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: 'online' | 'offline' | 'busy';
  lastSeen: Date;
  bio?: string;
  phoneNumber?: string;
  settings?: UserSettings; // Optional for other users, required for current user
}

export interface Reaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  content: string; // Text content or File Name
  type: MessageType;
  timestamp: Date;
  status: MessageStatus;
  mediaUrl?: string; // For images, videos, audio
  fileSize?: string;
  location?: { lat: number; lng: number; address?: string };
  reactions: Reaction[];
  replyToId?: string;
  forwarded?: boolean;
  isEdited?: boolean;
  isDeleted?: boolean;
}

export interface Chat {
  id: string;
  type: 'individual' | 'group';
  participants: User[];
  messages: Message[];
  unreadCount: number;
  lastMessage?: Message;
  pinned: boolean;
  archived: boolean;
  muteUntil?: Date | null;
  wallpaper?: string;
}

export interface Story {
  id: string;
  userId: string;
  type: 'image' | 'video' | 'text';
  content: string; // URL or text
  background?: string; // For text stories
  timestamp: Date;
  viewers: User[]; // List of users who viewed
  expiresAt: Date;
}

export enum CallType {
  AUDIO = 'audio',
  VIDEO = 'video'
}

export enum CallStatus {
  MISSED = 'missed',
  INCOMING = 'incoming',
  OUTGOING = 'outgoing',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  ONGOING = 'ongoing', // For active calls UI
  RINGING = 'ringing'
}

export interface CallLog {
  id: string;
  userId: string; // The other participant
  type: CallType;
  direction: 'incoming' | 'outgoing';
  status: CallStatus;
  timestamp: Date;
  duration?: number; // Seconds
}
