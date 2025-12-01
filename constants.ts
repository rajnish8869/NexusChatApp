
import { User, Chat, MessageType, MessageStatus, Story, CallLog, CallType, CallStatus } from './types';

export const DEFAULT_WALLPAPER = "https://i.pinimg.com/originals/97/c0/07/97c00759d90d786d9b6096d274ad3e07.png";

export const CURRENT_USER: User = {
  id: 'me',
  name: 'Alex Developer',
  email: 'alex@nexus.chat',
  avatar: 'https://i.pravatar.cc/150?u=alex',
  status: 'online',
  lastSeen: new Date(),
  bio: 'Building the future 🚀',
  phoneNumber: '+1 555 0123',
  settings: {
    privacy: { lastSeen: 'everyone', profilePhoto: 'everyone', readReceipts: true },
    notifications: { sound: true, vibration: true, preview: true },
    theme: 'light',
    wallpaper: DEFAULT_WALLPAPER
  }
};

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Sarah Designer',
    email: 'sarah@nexus.chat',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    status: 'online',
    lastSeen: new Date(),
    bio: 'Pixel perfectionist 🎨',
    phoneNumber: '+1 555 0124'
  },
  {
    id: 'u2',
    name: 'John Manager',
    email: 'john@nexus.chat',
    avatar: 'https://i.pravatar.cc/150?u=john',
    status: 'offline',
    lastSeen: new Date(Date.now() - 1000 * 60 * 15),
    bio: 'Meetings, meetings, meetings 📅',
    phoneNumber: '+1 555 0125'
  },
  {
    id: 'u3',
    name: 'Emily Engineer',
    email: 'emily@nexus.chat',
    avatar: 'https://i.pravatar.cc/150?u=emily',
    status: 'busy',
    lastSeen: new Date(Date.now() - 1000 * 60 * 60),
    bio: 'Coding away... 💻',
    phoneNumber: '+1 555 0126'
  }
];

export const MOCK_STORIES: Story[] = [
  {
    id: 's1',
    userId: 'u1',
    type: 'image',
    content: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 22),
    viewers: []
  },
  {
    id: 's2',
    userId: 'u1',
    type: 'text',
    content: 'Just finished the new design! 🎨',
    background: '#FF5733',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 22.5),
    viewers: []
  },
  {
    id: 's3',
    userId: 'u3',
    type: 'video',
    content: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 23.5),
    viewers: []
  }
];

export const MOCK_CALL_LOGS: CallLog[] = [
  {
    id: 'cl1',
    userId: 'u1',
    type: CallType.AUDIO,
    direction: 'incoming',
    status: CallStatus.MISSED,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5)
  },
  {
    id: 'cl2',
    userId: 'u2',
    type: CallType.VIDEO,
    direction: 'outgoing',
    status: CallStatus.ACCEPTED,
    duration: 340, // 5m 40s
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24)
  }
];

export const INITIAL_CHATS: Chat[] = [
  {
    id: 'c1',
    type: 'individual',
    participants: [MOCK_USERS[0]],
    unreadCount: 2,
    pinned: true,
    archived: false,
    messages: [
      {
        id: 'm1',
        senderId: 'u1',
        content: 'Hey Alex! Did you see the new designs?',
        type: MessageType.TEXT,
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        status: MessageStatus.READ,
        reactions: []
      },
      {
        id: 'm2',
        senderId: 'me',
        content: 'Not yet, send them over!',
        type: MessageType.TEXT,
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        status: MessageStatus.READ,
        reactions: []
      },
      {
        id: 'm3',
        senderId: 'u1',
        content: 'Here is the dashboard mock.',
        type: MessageType.IMAGE,
        mediaUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        status: MessageStatus.DELIVERED,
        reactions: [{ emoji: '👍', count: 1, userReacted: false }]
      },
      {
        id: 'm4',
        senderId: 'u1',
        content: 'Let me know what you think when you have a sec.',
        type: MessageType.TEXT,
        timestamp: new Date(Date.now() - 1000 * 60 * 2),
        status: MessageStatus.DELIVERED,
        reactions: []
      }
    ]
  },
  {
    id: 'c2',
    type: 'individual',
    participants: [MOCK_USERS[1]],
    unreadCount: 0,
    pinned: false,
    archived: false,
    messages: [
      {
        id: 'm10',
        senderId: 'u2',
        content: 'Meeting in 5?',
        type: MessageType.TEXT,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        status: MessageStatus.READ,
        reactions: []
      },
      {
        id: 'm11',
        senderId: 'me',
        content: 'Voice note',
        type: MessageType.AUDIO,
        mediaUrl: 'mock_audio.mp3', // Placeholder
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.9),
        status: MessageStatus.READ,
        reactions: []
      }
    ]
  }
];
