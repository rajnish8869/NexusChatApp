
import React, { useState, useEffect } from 'react';
import { User, Chat, Story, CallLog, CallStatus, CallType } from '../types';

interface SidebarProps {
  currentUser: User;
  chats: Chat[];
  stories: Story[];
  callLogs: CallLog[];
  users: User[];
  activeChatId: string | null;
  activeTab: 'chats' | 'status' | 'calls' | 'settings';
  currentTheme: 'light' | 'dark';
  onTabChange: (tab: 'chats' | 'status' | 'calls' | 'settings') => void;
  onSelectChat: (chatId: string) => void;
  onCreateChat: (userId: string) => void;
  onViewStory: (storyId: string) => void;
  onStartCall: (userId: string, type: CallType) => void;
  onToggleTheme: () => void;
}

type SettingsView = 'main' | 'account' | 'privacy' | 'chats' | 'notifications' | 'storage' | 'help';

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentUser, 
  chats, 
  stories,
  callLogs,
  activeChatId, 
  activeTab,
  currentTheme,
  onTabChange,
  onSelectChat,
  users,
  onCreateChat,
  onViewStory,
  onStartCall,
  onToggleTheme
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [settingsView, setSettingsView] = useState<SettingsView>('main');

  // Reset settings view when tab changes
  useEffect(() => {
    if (activeTab !== 'settings') {
      setSettingsView('main');
    }
  }, [activeTab]);

  const filteredChats = chats.filter(chat => {
    const partner = chat.participants.find(p => p.id !== currentUser.id);
    return partner?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Group stories by user
  const storiesByUser = React.useMemo(() => {
    const grouped: Record<string, Story[]> = {};
    stories.forEach(s => {
      if (!grouped[s.userId]) grouped[s.userId] = [];
      grouped[s.userId].push(s);
    });
    return grouped;
  }, [stories]);

  const getPartner = (chat: Chat) => chat.participants.find(p => p.id !== currentUser.id) || chat.participants[0];
  const getUser = (id: string) => users.find(u => u.id === id) || currentUser;

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString();
  };

  const SettingsHeader = ({ title, onBack }: { title: string, onBack: () => void }) => (
    <div className="flex items-center space-x-4 mb-6 pt-2">
      <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition text-gray-600 dark:text-gray-300">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
    </div>
  );

  const Toggle = ({ label, checked, onChange }: { label: string, checked: boolean, onChange?: () => void }) => (
    <div className="flex items-center justify-between py-3 cursor-pointer" onClick={onChange}>
      <span className="text-gray-800 dark:text-gray-200">{label}</span>
      <div className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${checked ? 'bg-nexus-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
      </div>
    </div>
  );

  const renderSettingsContent = () => {
    switch (settingsView) {
      case 'account':
        return (
          <div className="animate-in slide-in-from-right duration-200">
            <SettingsHeader title="Account" onBack={() => setSettingsView('main')} />
            <div className="space-y-6">
              <div className="flex flex-col items-center mb-6">
                <div className="relative group cursor-pointer">
                  <img src={currentUser.avatar} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 dark:border-gray-700" />
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                  </div>
                </div>
                <p className="mt-2 text-nexus-600 font-medium cursor-pointer">Change Profile Photo</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Your Name</label>
                  <input type="text" defaultValue={currentUser.name} className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-nexus-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Bio / About</label>
                  <input type="text" defaultValue={currentUser.bio} className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-nexus-500 outline-none" />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</label>
                   <input type="email" defaultValue={currentUser.email} disabled className="w-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg px-4 py-3 cursor-not-allowed" />
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                <button className="w-full py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition font-medium flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  <span>Delete My Account</span>
                </button>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="animate-in slide-in-from-right duration-200">
            <SettingsHeader title="Privacy" onBack={() => setSettingsView('main')} />
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-nexus-600 uppercase tracking-wide">Who can see my personal info</h3>
                {['Last Seen', 'Profile Photo', 'About', 'Status'].map((item) => (
                  <div key={item} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50">
                    <span className="text-gray-800 dark:text-gray-200">{item}</span>
                    <select className="bg-transparent text-gray-500 dark:text-gray-400 text-sm focus:outline-none cursor-pointer">
                      <option>Everyone</option>
                      <option>My Contacts</option>
                      <option>Nobody</option>
                    </select>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-4">
                <Toggle label="Read Receipts" checked={true} />
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
                  If turned off, you won't send or receive Read Receipts. Read Receipts are always sent for group chats.
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="flex items-center justify-between w-full py-2">
                  <span className="text-gray-800 dark:text-gray-200">Blocked Contacts</span>
                  <span className="text-gray-500 text-sm">3</span>
                </button>
                <button className="flex items-center justify-between w-full py-2">
                  <span className="text-gray-800 dark:text-gray-200">Disappearing Messages</span>
                  <span className="text-gray-500 text-sm">Off</span>
                </button>
              </div>
            </div>
          </div>
        );

      case 'chats':
        return (
          <div className="animate-in slide-in-from-right duration-200">
            <SettingsHeader title="Chats" onBack={() => setSettingsView('main')} />
            <div className="space-y-6">
              
              <div className="space-y-4">
                 <h3 className="text-sm font-bold text-nexus-600 uppercase tracking-wide">Display</h3>
                 <div className="flex items-center justify-between py-2">
                    <span className="text-gray-800 dark:text-gray-200">Theme</span>
                    <button onClick={onToggleTheme} className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full">
                       {currentTheme === 'light' ? (
                          <><span>Light</span><div className="w-3 h-3 bg-yellow-400 rounded-full"></div></>
                       ) : (
                          <><span>Dark</span><div className="w-3 h-3 bg-blue-500 rounded-full"></div></>
                       )}
                    </button>
                 </div>
                 
                 <div className="py-2">
                    <span className="text-gray-800 dark:text-gray-200 block mb-3">Wallpaper</span>
                    <div className="flex space-x-3 overflow-x-auto pb-2">
                       {['bg-gray-200', 'bg-blue-200', 'bg-red-200', 'bg-green-200', 'bg-yellow-200', 'bg-purple-200'].map((color, i) => (
                         <div key={i} className={`w-12 h-20 rounded-lg ${color} border-2 border-transparent hover:border-nexus-500 cursor-pointer shadow-sm`}></div>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                 <h3 className="text-sm font-bold text-nexus-600 uppercase tracking-wide">Chat Settings</h3>
                 <Toggle label="Enter is Send" checked={true} />
                 <Toggle label="Media Visibility" checked={true} />
                 <div className="pt-2">
                    <div className="text-gray-800 dark:text-gray-200 mb-1">Font Size</div>
                    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                       {['Small', 'Medium', 'Large'].map(size => (
                         <button key={size} className={`flex-1 py-1 text-sm rounded-md ${size === 'Medium' ? 'bg-white dark:bg-gray-600 shadow text-nexus-600' : 'text-gray-500'}`}>{size}</button>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                 <button className="flex items-center space-x-3 w-full py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded px-2 -ml-2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                    <span>Chat Backup</span>
                 </button>
                 <button className="flex items-center space-x-3 w-full py-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/10 rounded px-2 -ml-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                    <span>Archive All Chats</span>
                 </button>
                 <button className="flex items-center space-x-3 w-full py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded px-2 -ml-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    <span>Delete All Chats</span>
                 </button>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="animate-in slide-in-from-right duration-200">
            <SettingsHeader title="Notifications" onBack={() => setSettingsView('main')} />
            <div className="space-y-6">
              <div className="space-y-4">
                 <Toggle label="Conversation Tones" checked={true} />
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                 <h3 className="text-sm font-bold text-nexus-600 uppercase tracking-wide mb-4">Messages</h3>
                 <Toggle label="Show Notifications" checked={true} />
                 <Toggle label="Reaction Notifications" checked={true} />
                 <Toggle label="High Priority" checked={false} />
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                 <h3 className="text-sm font-bold text-nexus-600 uppercase tracking-wide mb-4">Calls</h3>
                 <div className="flex justify-between items-center py-2">
                    <span className="text-gray-800 dark:text-gray-200">Ringtone</span>
                    <span className="text-sm text-gray-500">Default (Galaxy)</span>
                 </div>
                 <div className="flex justify-between items-center py-2">
                    <span className="text-gray-800 dark:text-gray-200">Vibrate</span>
                    <span className="text-sm text-gray-500">Default</span>
                 </div>
              </div>
            </div>
          </div>
        );

      case 'storage':
        return (
          <div className="animate-in slide-in-from-right duration-200">
            <SettingsHeader title="Storage and Data" onBack={() => setSettingsView('main')} />
            <div className="space-y-6">
              <div className="flex items-center space-x-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                 <div className="p-3 bg-nexus-100 dark:bg-nexus-900 rounded-full text-nexus-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
                 </div>
                 <div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">4.2 GB</div>
                    <div className="text-xs text-gray-500">Used</div>
                 </div>
                 <div className="h-8 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>
                 <div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">12.5 GB</div>
                    <div className="text-xs text-gray-500">Free</div>
                 </div>
              </div>
              <button className="w-full py-2 text-nexus-600 font-medium border border-nexus-200 dark:border-gray-600 rounded-lg hover:bg-nexus-50 dark:hover:bg-gray-700 transition">
                 Manage Storage
              </button>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                 <div className="flex justify-between items-center py-1">
                   <span className="text-gray-800 dark:text-gray-200">Network Usage</span>
                   <span className="text-sm text-gray-500">1.2 GB Sent • 8.4 GB Received</span>
                 </div>
                 <Toggle label="Use Less Data for Calls" checked={false} />
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                 <h3 className="text-sm font-bold text-nexus-600 uppercase tracking-wide mb-3">Media Auto-Download</h3>
                 {['Photos', 'Audio', 'Videos', 'Documents'].map(type => (
                   <div key={type} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                      <span className="text-gray-800 dark:text-gray-200">{type}</span>
                      <span className="text-sm text-gray-500">Wi-Fi Only</span>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        );

      case 'help':
        return (
          <div className="animate-in slide-in-from-right duration-200">
            <SettingsHeader title="Help" onBack={() => setSettingsView('main')} />
            <div className="space-y-4">
               {[
                 { q: 'Help Center', d: 'Get help with common questions' },
                 { q: 'Contact Us', d: 'Questions? Need help?' },
                 { q: 'Terms and Privacy Policy', d: '' },
                 { q: 'App Info', d: 'Version 2.0.1' }
               ].map((item, i) => (
                 <button key={i} className="flex items-center space-x-4 w-full p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition text-left">
                    <div className="p-2 bg-nexus-50 dark:bg-gray-700 rounded text-nexus-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <div className="text-gray-900 dark:text-gray-100 font-medium">{item.q}</div>
                      {item.d && <div className="text-xs text-gray-500">{item.d}</div>}
                    </div>
                 </button>
               ))}

               <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
                  <h4 className="font-bold text-gray-700 dark:text-gray-300">Invite your friends</h4>
                  <p className="text-xs text-gray-500 mt-1 mb-3">Share the NexusChat experience</p>
                  <button className="px-4 py-2 bg-nexus-600 text-white rounded-full text-sm font-medium hover:bg-nexus-700 transition">Share Link</button>
               </div>
            </div>
          </div>
        );

      default: // 'main'
        return (
          <div className="p-4 space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center space-x-4 mb-6 cursor-pointer" onClick={() => setSettingsView('account')}>
               <img src={currentUser.avatar} className="w-20 h-20 rounded-full object-cover border-4 border-nexus-100 dark:border-gray-700" />
               <div className="flex-1 min-w-0">
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">{currentUser.name}</h2>
                 <p className="text-gray-500 dark:text-gray-400 truncate">{currentUser.bio}</p>
                 <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded-full">Online</span>
               </div>
               <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>

            <div className="space-y-1">
              {[
                { id: 'account', name: 'Account', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                { id: 'privacy', name: 'Privacy', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
                { id: 'chats', name: 'Chats', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
                { id: 'notifications', name: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
                { id: 'storage', name: 'Storage and Data', icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4' },
                { id: 'help', name: 'Help', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
              ].map(item => (
                <button 
                  key={item.id} 
                  onClick={() => setSettingsView(item.id as SettingsView)}
                  className="w-full flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition"
                >
                   <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-full mr-3 text-gray-600 dark:text-gray-300">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                   </div>
                   <span className="flex-1 text-left text-gray-900 dark:text-gray-100 font-medium">{item.name}</span>
                   <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              ))}
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
               <p className="text-xs text-gray-400 mb-4">NexusChat v2.0.1</p>
               <button onClick={() => window.location.reload()} className="text-red-500 hover:text-red-700 font-medium text-sm">
                 Log Out
               </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-dark-panel border-r border-gray-200 dark:border-gray-700 w-full md:w-96 transition-colors">
      {/* Header */}
      <div className="p-4 bg-nexus-600 dark:bg-gray-800 text-white flex justify-between items-center shadow-md shrink-0 transition-colors">
        <div className="flex items-center space-x-3">
          <img src={currentUser.avatar} alt="Me" className="w-10 h-10 rounded-full border-2 border-white/50 cursor-pointer hover:opacity-80 transition" onClick={() => { onTabChange('settings'); setSettingsView('main'); }} />
          <span className="font-semibold text-lg">NexusChat</span>
        </div>
        <div className="flex space-x-2">
           <button onClick={() => { onTabChange('settings'); setSettingsView('main'); }} className="p-2 hover:bg-white/10 rounded-full transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
           </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white dark:bg-dark-panel border-b border-gray-200 dark:border-gray-700 shrink-0 transition-colors">
        {[
          { id: 'chats', label: 'Chats', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
          { id: 'status', label: 'Status', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' },
          { id: 'calls', label: 'Calls', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => onTabChange(tab.id as any)} 
            className={`flex-1 py-3 text-center transition flex flex-col items-center justify-center space-y-1 ${activeTab === tab.id ? 'text-nexus-600 border-b-2 border-nexus-600 bg-nexus-50 dark:bg-gray-800' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} /></svg>
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Search - only show if NOT in settings */}
      {activeTab !== 'settings' && (
        <div className="p-3 bg-white dark:bg-dark-panel shrink-0 transition-colors">
          <div className="relative">
            <input 
              type="text" 
              placeholder={`Search ${activeTab}...`} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-nexus-500 text-gray-800 dark:text-gray-100 transition"
            />
            <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-dark-panel transition-colors scrollbar-hide">
        
        {/* CHATS TAB */}
        {activeTab === 'chats' && (
          <>
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredChats.map(chat => {
                const partner = getPartner(chat);
                const lastMsg = chat.messages[chat.messages.length - 1];
                return (
                  <li 
                    key={chat.id} 
                    onClick={() => onSelectChat(chat.id)}
                    className={`px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center space-x-3 ${activeChatId === chat.id ? 'bg-nexus-50 dark:bg-gray-800' : ''}`}
                  >
                    <div className="relative flex-shrink-0">
                      <img src={partner.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                      {partner.status === 'online' && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{partner.name}</h3>
                        {lastMsg && (
                          <span className={`text-xs ${chat.unreadCount > 0 ? 'text-nexus-600 font-bold' : 'text-gray-400'}`}>
                            {formatDate(lastMsg.timestamp)}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <p className={`text-sm truncate flex-1 ${chat.unreadCount > 0 ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                          {lastMsg ? (
                            <>
                              {lastMsg.senderId === currentUser.id && <span className="text-gray-400 mr-1">You:</span>}
                              {lastMsg.type === 'image' ? '📷 Photo' : lastMsg.type === 'audio' ? '🎤 Voice Message' : lastMsg.content}
                            </>
                          ) : 'Draft'}
                        </p>
                        {chat.pinned && <svg className="w-3 h-3 text-gray-400 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>}
                      </div>
                    </div>
                    {chat.unreadCount > 0 && (
                      <div className="bg-nexus-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">{chat.unreadCount}</div>
                    )}
                  </li>
                );
              })}
            </ul>
            <button 
              onClick={() => {/* Mock open new chat modal */}}
              className="absolute bottom-6 right-6 md:hidden w-12 h-12 bg-nexus-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-nexus-700 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
          </>
        )}

        {/* STATUS TAB */}
        {activeTab === 'status' && (
          <div className="p-4 space-y-6">
            <div className="flex items-center space-x-4 cursor-pointer">
              <div className="relative">
                 <img src={currentUser.avatar} className="w-14 h-14 rounded-full object-cover opacity-80" alt="My Status" />
                 <div className="absolute bottom-0 right-0 bg-nexus-600 text-white rounded-full w-5 h-5 flex items-center justify-center border border-white text-xs font-bold">+</div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">My Status</h3>
                <p className="text-sm text-gray-500">Tap to add status update</p>
              </div>
            </div>

            <div className="space-y-4">
               <h4 className="text-xs font-bold text-gray-400 uppercase">Recent Updates</h4>
               {Object.keys(storiesByUser).map(userId => {
                 const user = getUser(userId);
                 const userStories = storiesByUser[userId];
                 if(userStories.length === 0) return null;
                 const latestStory = userStories[userStories.length - 1];

                 return (
                   <div key={userId} onClick={() => onViewStory(latestStory.id)} className="flex items-center space-x-4 cursor-pointer group">
                     <div className="p-[2px] rounded-full bg-gradient-to-tr from-yellow-400 via-nexus-500 to-purple-500">
                        <div className="bg-white p-[2px] rounded-full">
                           <img src={user.avatar} className="w-12 h-12 rounded-full object-cover" alt={user.name} />
                        </div>
                     </div>
                     <div>
                       <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-nexus-600 transition">{user.name}</h3>
                       <p className="text-sm text-gray-500">{formatDate(latestStory.timestamp)}</p>
                     </div>
                   </div>
                 );
               })}
            </div>
          </div>
        )}

        {/* CALLS TAB */}
        {activeTab === 'calls' && (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
             {callLogs.map(log => {
               const user = getUser(log.userId);
               return (
                 <li key={log.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                   <div className="flex items-center space-x-3">
                     <img src={user.avatar} className="w-12 h-12 rounded-full object-cover" alt="" />
                     <div>
                       <h3 className={`font-semibold ${log.status === CallStatus.MISSED ? 'text-red-500' : 'text-gray-900 dark:text-gray-100'}`}>{user.name}</h3>
                       <div className="flex items-center space-x-1 text-sm text-gray-500">
                         {log.direction === 'outgoing' ? (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                         ) : (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                         )}
                         <span>{formatDate(log.timestamp)}</span>
                       </div>
                     </div>
                   </div>
                   <button onClick={() => onStartCall(user.id, log.type)} className="p-2 text-nexus-600 hover:bg-nexus-50 rounded-full">
                     {log.type === CallType.AUDIO ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                     ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                     )}
                   </button>
                 </li>
               );
             })}
          </ul>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && renderSettingsContent()}
      </div>
    </div>
  );
};
