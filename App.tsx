
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { CallModal } from './components/CallModal';
import { StoryViewer } from './components/StoryViewer';
import { CURRENT_USER, INITIAL_CHATS, MOCK_USERS, MOCK_STORIES, MOCK_CALL_LOGS } from './constants';
import { Chat, MessageType, MessageStatus, CallType, User, Story, CallLog } from './types';

// Mock simple authentication state
type AuthState = 'login' | 'app';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>('login');
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeCall, setActiveCall] = useState<{ isOpen: boolean, type: CallType, partnerId: string } | null>(null);
  const [viewingStoryId, setViewingStoryId] = useState<string | null>(null);
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<'chats' | 'status' | 'calls' | 'settings'>('chats');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Theme Management
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  // Realtime Simulation: Update Last Seen
  useEffect(() => {
    const interval = setInterval(() => {
      // randomly update online status of users
      // This mocks Socket.io user updates
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Authentication Mock
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthState('app');
  };

  // Chat Logic
  const activeChat = chats.find(c => c.id === activeChatId) || null;

  const handleSendMessage = (text: string, type: MessageType, mediaUrl?: string) => {
    if (!activeChatId) return;

    const newMessage = {
      id: `m-${Date.now()}`,
      senderId: CURRENT_USER.id,
      content: text,
      type,
      mediaUrl,
      timestamp: new Date(),
      status: MessageStatus.SENT,
      reactions: []
    };

    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === activeChatId) {
        // Move chat to top
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastMessage: newMessage,
          pinned: chat.pinned // preserve pinned state
        };
      }
      return chat;
    }).sort((a, b) => {
       if (a.pinned && !b.pinned) return -1;
       if (!a.pinned && b.pinned) return 1;
       const ta = a.lastMessage?.timestamp.getTime() || 0;
       const tb = b.lastMessage?.timestamp.getTime() || 0;
       return tb - ta;
    }));

    // Mock Message Status Lifecycle (Realtime simulation)
    // Sent -> Delivered (1s) -> Read (2s)
    setTimeout(() => {
       setChats(prev => prev.map(c => 
         c.id === activeChatId ? {
           ...c, messages: c.messages.map(m => m.id === newMessage.id ? { ...m, status: MessageStatus.DELIVERED } : m)
         } : c
       ));
    }, 1000);

    setTimeout(() => {
       setChats(prev => prev.map(c => 
         c.id === activeChatId ? {
           ...c, messages: c.messages.map(m => m.id === newMessage.id ? { ...m, status: MessageStatus.READ } : m)
         } : c
       ));
    }, 2500);

    // Mock Auto-Reply after 3 seconds
    setTimeout(() => {
      const responseMsg = {
        id: `m-r-${Date.now()}`,
        senderId: activeChat?.participants.find(p => p.id !== CURRENT_USER.id)?.id || 'unknown',
        content: type === MessageType.AUDIO ? "Can't listen right now, in a meeting." : "That's cool! Let me check.",
        type: MessageType.TEXT,
        timestamp: new Date(),
        status: MessageStatus.DELIVERED,
        reactions: []
      };

      setChats(prevChats => prevChats.map(chat => {
        if (chat.id === activeChatId) {
          return {
             ...chat,
             messages: [...chat.messages, responseMsg],
             lastMessage: responseMsg,
             unreadCount: chat.id === activeChatId ? 0 : chat.unreadCount + 1
          };
        }
        return chat;
      }));
    }, 4000);
  };

  const handleReaction = (chatId: string, messageId: string, emoji: string) => {
    setChats(prev => prev.map(chat => {
      if (chat.id !== chatId) return chat;
      return {
        ...chat,
        messages: chat.messages.map(msg => {
          if (msg.id !== messageId) return msg;
          
          const existingReaction = msg.reactions.find(r => r.emoji === emoji);
          let newReactions;

          if (existingReaction) {
            if (existingReaction.userReacted) {
              // User removing their reaction
              newReactions = msg.reactions.map(r => 
                r.emoji === emoji ? { ...r, count: r.count - 1, userReacted: false } : r
              ).filter(r => r.count > 0);
            } else {
              // User adding to existing emoji count
              newReactions = msg.reactions.map(r => 
                r.emoji === emoji ? { ...r, count: r.count + 1, userReacted: true } : r
              );
            }
          } else {
            // New reaction type
            newReactions = [...msg.reactions, { emoji, count: 1, userReacted: true }];
          }
          
          return { ...msg, reactions: newReactions };
        })
      };
    }));
  };

  const handleEditMessage = (chatId: string, messageId: string, newContent: string) => {
    setChats(prev => prev.map(chat => {
      if (chat.id !== chatId) return chat;
      return {
        ...chat,
        messages: chat.messages.map(msg => 
          msg.id === messageId ? { ...msg, content: newContent, isEdited: true } : msg
        )
      };
    }));
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    setIsMobileListVisible(false);
    // Mark as read
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, unreadCount: 0 } : c));
  };

  const handleCreateChat = (userId: string) => {
    const existing = chats.find(c => c.participants.some(p => p.id === userId));
    if (existing) {
      handleSelectChat(existing.id);
      setSidebarTab('chats');
      return;
    }
    
    const user = MOCK_USERS.find(u => u.id === userId);
    if (!user) return;

    const newChat: Chat = {
      id: `c-${Date.now()}`,
      type: 'individual',
      participants: [user],
      messages: [],
      unreadCount: 0,
      pinned: false,
      archived: false
    };

    setChats([newChat, ...chats]);
    setActiveChatId(newChat.id);
    setSidebarTab('chats');
    setIsMobileListVisible(false);
  };

  const handleStartCall = (userId: string | null, type: CallType) => {
    const partnerId = userId || (activeChat?.participants.find(p => p.id !== CURRENT_USER.id)?.id);
    if(partnerId) {
      setActiveCall({ isOpen: true, type, partnerId });
    }
  };

  // Login Screen
  if (authState === 'login') {
    return (
      <div className="min-h-screen bg-nexus-50 dark:bg-dark-bg flex items-center justify-center p-4">
        <div className="bg-white dark:bg-dark-panel p-8 rounded-2xl shadow-xl w-full max-w-md transition-all">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-nexus-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">NexusChat</h1>
            <p className="text-gray-500 dark:text-gray-400">Connect with everyone, everywhere.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" defaultValue="alex@nexus.chat" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-nexus-500 focus:outline-none text-gray-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input type="password" defaultValue="password" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-nexus-500 focus:outline-none text-gray-800 dark:text-white" />
            </div>
            <button type="submit" className="w-full bg-nexus-600 hover:bg-nexus-700 text-white font-bold py-3 rounded-lg transition transform active:scale-[0.98] shadow-md">
              Sign In
            </button>
          </form>
          <div className="mt-6 flex justify-between text-xs text-gray-400">
             <span>v2.0 Beta</span>
             <span>Encrypted & Secure</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-dark-bg font-sans">
      {/* Sidebar */}
      <div className={`${isMobileListVisible ? 'block' : 'hidden'} md:block h-full shadow-xl z-20 w-full md:w-auto`}>
        <Sidebar 
          currentUser={CURRENT_USER}
          chats={chats}
          stories={MOCK_STORIES}
          callLogs={MOCK_CALL_LOGS}
          activeChatId={activeChatId}
          activeTab={sidebarTab}
          currentTheme={theme}
          onTabChange={setSidebarTab}
          onSelectChat={handleSelectChat}
          users={MOCK_USERS}
          onCreateChat={handleCreateChat}
          onViewStory={setViewingStoryId}
          onStartCall={(userId, type) => handleStartCall(userId, type)}
          onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
        />
      </div>

      {/* Main Chat Window */}
      <div className={`flex-1 flex flex-col h-full relative ${!isMobileListVisible ? 'block' : 'hidden md:flex'}`}>
        <ChatWindow 
          chat={activeChat}
          currentUser={CURRENT_USER}
          onSendMessage={handleSendMessage}
          onBack={() => setIsMobileListVisible(true)}
          onStartCall={(type) => handleStartCall(null, type)}
          onReact={(msgId, emoji) => activeChatId && handleReaction(activeChatId, msgId, emoji)}
          onEdit={(msgId, newContent) => activeChatId && handleEditMessage(activeChatId, msgId, newContent)}
        />
      </div>

      {/* Call Modal */}
      {activeCall && (
        <CallModal 
          isOpen={activeCall.isOpen}
          type={activeCall.type}
          partner={MOCK_USERS.find(u => u.id === activeCall.partnerId) || MOCK_USERS[0]}
          onEndCall={() => setActiveCall(null)}
        />
      )}

      {/* Story Viewer */}
      {viewingStoryId && (
        <StoryViewer 
          stories={MOCK_STORIES.filter(s => s.userId === (MOCK_STORIES.find(st => st.id === viewingStoryId)?.userId))}
          initialStoryId={viewingStoryId}
          users={MOCK_USERS}
          onClose={() => setViewingStoryId(null)}
        />
      )}
    </div>
  );
};

export default App;
