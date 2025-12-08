
import React, { useState, useEffect, useRef } from 'react';
import { User, Chat, Story, CallLog, CallStatus, CallType, UserSettings } from '../types';
import { WALLPAPERS } from '../constants';

interface SidebarProps {
  currentUser: User;
  chats: Chat[];
  stories: Story[];
  callLogs: CallLog[];
  users: User[];
  activeChatId: string | null;
  activeTab: 'chats' | 'status' | 'calls' | 'settings';
  currentTheme: 'light' | 'dark';
  currentWallpaper: string;
  navPosition: 'top' | 'bottom';
  onTabChange: (tab: 'chats' | 'status' | 'calls' | 'settings') => void;
  onSelectChat: (chatId: string) => void;
  onCreateChat: (userId: string) => void;
  onViewStory: (storyId: string) => void;
  onStartCall: (userId: string, type: CallType) => void;
  onToggleTheme: () => void;
  onWallpaperChange: (url: string) => void;
  onClearChats: () => void;
  onAddStory: (type: 'text' | 'image' | 'video', content: string) => void;
  onToggleReadReceipts: () => void;
  onUnblockUser: (userId: string) => void;
  onToggleNavPosition: () => void;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
}

type SettingsView = 'main' | 'account' | 'privacy' | 'chats' | 'notifications' | 'storage' | 'help' | 'app-info' | 'help-center' | 'contact-us' | 'terms';

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentUser, 
  chats, 
  stories,
  callLogs,
  activeChatId, 
  activeTab,
  currentTheme,
  currentWallpaper,
  navPosition,
  onTabChange,
  onSelectChat,
  users,
  onCreateChat,
  onViewStory,
  onStartCall,
  onToggleTheme,
  onWallpaperChange,
  onClearChats,
  onAddStory,
  onToggleReadReceipts,
  onUnblockUser,
  onToggleNavPosition,
  onUpdateSettings
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [settingsView, setSettingsView] = useState<SettingsView>('main');
  const [showArchived, setShowArchived] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const storyInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeTab !== 'settings') {
      setSettingsView('main');
    }
  }, [activeTab]);

  const filteredChats = chats.filter(chat => {
    if (showArchived && !chat.archived) return false;
    if (!showArchived && chat.archived) return false;
    const partner = chat.participants.find(p => p.id !== currentUser.id) || chat.participants[0];
    return partner?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

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

  const handleStoryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
       const url = URL.createObjectURL(file);
       const type = file.type.startsWith('video/') ? 'video' : 'image';
       onAddStory(type, url);
    }
  };

  const SettingsHeader = ({ title, onBack }: { title: string, onBack: () => void }) => (
    <div className="flex items-center space-x-4 mb-6 sticky top-0 bg-white/80 dark:bg-dark-panel/80 backdrop-blur z-10 py-2">
      <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition text-gray-600 dark:text-gray-300">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
      </button>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{title}</h2>
    </div>
  );

  const Toggle = ({ label, checked, onChange, description }: { label: string, checked: boolean, onChange?: () => void, description?: string }) => (
    <div className="flex items-center justify-between py-3 cursor-pointer group" onClick={onChange}>
      <div className="flex-1 pr-4">
        <span className="text-gray-700 dark:text-gray-200 group-hover:text-nexus-600 dark:group-hover:text-nexus-400 transition-colors font-medium block">{label}</span>
        {description && <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">{description}</span>}
      </div>
      <div className={`w-11 h-6 shrink-0 flex items-center rounded-full p-1 transition-colors duration-300 ${checked ? 'bg-nexus-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
      </div>
    </div>
  );

  const blockedList = users.filter(u => currentUser.blockedUsers.includes(u.id));

  const renderSettingsContent = () => {
    switch (settingsView) {
      case 'account':
        return (
          <div className="animate-pop-in px-4 pb-4">
            <SettingsHeader title="Account" onBack={() => setSettingsView('main')} />
            <div className="bg-white dark:bg-dark-hover rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50 space-y-6">
              <div className="flex flex-col items-center">
                <div className="relative group cursor-pointer">
                  <img src={currentUser.avatar} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 dark:border-gray-600 shadow-md" />
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                  </div>
                </div>
                <button className="mt-3 text-nexus-600 dark:text-nexus-400 text-sm font-semibold hover:underline">Change Profile Photo</button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Your Name</label>
                  <input type="text" defaultValue={currentUser.name} className="w-full bg-gray-50 dark:bg-dark-input text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-nexus-500 focus:outline-none transition border border-gray-200 dark:border-gray-700" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
                  <input type="text" defaultValue={currentUser.email} readOnly className="w-full bg-gray-100 dark:bg-dark-bg text-gray-500 dark:text-gray-400 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-700 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Bio</label>
                  <textarea defaultValue={currentUser.bio} rows={3} className="w-full bg-gray-50 dark:bg-dark-input text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-nexus-500 focus:outline-none transition border border-gray-200 dark:border-gray-700" />
                </div>
              </div>
              <button className="w-full py-3 text-red-500 font-medium hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition">
                  Delete My Account
              </button>
            </div>
          </div>
        );
      case 'privacy':
          return (
              <div className="animate-pop-in px-4 pb-4">
                  <SettingsHeader title="Privacy" onBack={() => setSettingsView('main')} />
                  <div className="bg-white dark:bg-dark-hover rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50 space-y-4">
                      <div className="space-y-4 border-b border-gray-100 dark:border-gray-700 pb-4 mb-4">
                          <h3 className="text-nexus-600 dark:text-nexus-400 text-xs font-bold uppercase tracking-wider">Visibility</h3>
                          <div className="flex justify-between items-center">
                             <span className="text-gray-700 dark:text-gray-200">Last Seen</span>
                             <select 
                               value={currentUser.settings?.privacy.lastSeen}
                               onChange={(e) => onUpdateSettings({ privacy: { ...currentUser.settings!.privacy, lastSeen: e.target.value as any } })}
                               className="bg-gray-50 dark:bg-dark-input text-gray-900 dark:text-white text-sm rounded-lg p-2 border border-gray-200 dark:border-gray-700 outline-none"
                             >
                                 <option value="everyone">Everyone</option>
                                 <option value="contacts">Contacts</option>
                                 <option value="nobody">Nobody</option>
                             </select>
                          </div>
                      </div>

                      <Toggle 
                          label="Read Receipts" 
                          description="If turned off, you won't send or receive Read receipts."
                          checked={currentUser.settings?.privacy.readReceipts || false}
                          onChange={onToggleReadReceipts} 
                      />

                      <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                          <h3 className="text-nexus-600 dark:text-nexus-400 text-xs font-bold uppercase tracking-wider mb-3">Blocked Contacts ({blockedList.length})</h3>
                          {blockedList.length === 0 ? (
                              <p className="text-sm text-gray-400 italic">No blocked contacts.</p>
                          ) : (
                              <ul className="space-y-3">
                                  {blockedList.map(user => (
                                      <li key={user.id} className="flex items-center justify-between">
                                          <div className="flex items-center space-x-3">
                                              <img src={user.avatar} className="w-10 h-10 rounded-full" alt="" />
                                              <span className="text-gray-900 dark:text-white font-medium">{user.name}</span>
                                          </div>
                                          <button onClick={() => onUnblockUser(user.id)} className="text-xs bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition">Unblock</button>
                                      </li>
                                  ))}
                              </ul>
                          )}
                      </div>
                  </div>
              </div>
          );
      case 'notifications':
          return (
              <div className="animate-pop-in px-4 pb-4">
                  <SettingsHeader title="Notifications" onBack={() => setSettingsView('main')} />
                  <div className="bg-white dark:bg-dark-hover rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50 space-y-4">
                      <Toggle 
                          label="Conversation Tones" 
                          description="Play sounds for incoming and outgoing messages."
                          checked={currentUser.settings?.notifications.sound || false}
                          onChange={() => onUpdateSettings({ notifications: { ...currentUser.settings!.notifications, sound: !currentUser.settings!.notifications.sound } })} 
                      />
                      <Toggle 
                          label="Vibration" 
                          checked={currentUser.settings?.notifications.vibration || false}
                          onChange={() => onUpdateSettings({ notifications: { ...currentUser.settings!.notifications, vibration: !currentUser.settings!.notifications.vibration } })} 
                      />
                      <Toggle 
                          label="Show Previews" 
                          description="Preview message text inside new message notifications."
                          checked={currentUser.settings?.notifications.preview || false}
                          onChange={() => onUpdateSettings({ notifications: { ...currentUser.settings!.notifications, preview: !currentUser.settings!.notifications.preview } })} 
                      />
                  </div>
              </div>
          );
      case 'storage':
          return (
             <div className="animate-pop-in px-4 pb-4">
                 <SettingsHeader title="Storage & Data" onBack={() => setSettingsView('main')} />
                 <div className="bg-white dark:bg-dark-hover rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50 space-y-6">
                     <div>
                         <h3 className="text-nexus-600 dark:text-nexus-400 text-xs font-bold uppercase tracking-wider mb-3">Network Usage</h3>
                         <div className="flex items-center justify-between mb-2">
                             <span className="text-gray-700 dark:text-gray-300">Usage</span>
                             <span className="font-bold text-gray-900 dark:text-white">1.2 GB</span>
                         </div>
                         <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                             <div className="bg-nexus-500 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                         </div>
                     </div>
                     
                     <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                         <h3 className="text-nexus-600 dark:text-nexus-400 text-xs font-bold uppercase tracking-wider mb-3">Media Auto-Download</h3>
                         <div className="space-y-3">
                             {['Photos', 'Audio', 'Videos', 'Documents'].map(type => (
                                 <label key={type} className="flex items-center space-x-3 cursor-pointer">
                                     <input type="checkbox" defaultChecked className="form-checkbox text-nexus-600 rounded focus:ring-nexus-500 bg-gray-100 dark:bg-dark-input border-gray-300 dark:border-gray-600" />
                                     <span className="text-gray-700 dark:text-gray-200">{type}</span>
                                 </label>
                             ))}
                         </div>
                     </div>
                 </div>
             </div>
          );
      case 'help':
          return (
              <div className="animate-pop-in px-4 pb-4">
                  <SettingsHeader title="Help" onBack={() => setSettingsView('main')} />
                  <div className="bg-white dark:bg-dark-hover rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700/50">
                      {[
                          { label: 'Help Center', view: 'help-center' }, 
                          { label: 'Contact Us', view: 'contact-us' }, 
                          { label: 'Terms and Privacy Policy', view: 'terms' }, 
                          { label: 'App Info', view: 'app-info' }
                      ].map((item, i) => (
                          <button 
                            key={i} 
                            onClick={() => setSettingsView(item.view as SettingsView)}
                            className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition ${i !== 3 ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}
                          >
                              <span className="text-gray-800 dark:text-gray-200 font-medium">{item.label}</span>
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                          </button>
                      ))}
                  </div>
              </div>
          );
      case 'help-center':
          return (
              <div className="animate-pop-in px-4 pb-4">
                  <SettingsHeader title="Help Center" onBack={() => setSettingsView('help')} />
                  <div className="bg-white dark:bg-dark-hover rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50 space-y-4">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">How can we help?</h3>
                      <input type="text" placeholder="Search for issues..." className="w-full bg-gray-50 dark:bg-dark-input border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-nexus-500 outline-none" />
                      <div className="space-y-2 pt-2">
                        <p className="font-semibold text-nexus-600">Popular Topics</p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                           <li>How to block a contact</li>
                           <li>Changing privacy settings</li>
                           <li>Backup and Restore</li>
                           <li>Two-step verification</li>
                        </ul>
                      </div>
                  </div>
              </div>
          );
      case 'contact-us':
          return (
              <div className="animate-pop-in px-4 pb-4">
                  <SettingsHeader title="Contact Us" onBack={() => setSettingsView('help')} />
                  <div className="bg-white dark:bg-dark-hover rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50 space-y-4">
                      <p className="text-gray-700 dark:text-gray-200">Have questions or feedback? We'd love to hear from you.</p>
                      <textarea placeholder="Describe your issue..." rows={4} className="w-full bg-gray-50 dark:bg-dark-input border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-nexus-500 outline-none"></textarea>
                      <button onClick={() => { alert("Feedback sent!"); setSettingsView('help'); }} className="w-full py-3 bg-nexus-600 text-white font-bold rounded-xl shadow-md hover:bg-nexus-700 transition">Send Message</button>
                      <p className="text-xs text-center text-gray-400 mt-2">Support email: support@nexus.chat</p>
                  </div>
              </div>
          );
       case 'terms':
          return (
              <div className="animate-pop-in px-4 pb-4">
                  <SettingsHeader title="Terms & Privacy" onBack={() => setSettingsView('help')} />
                  <div className="bg-white dark:bg-dark-hover rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50 space-y-4 h-[60vh] overflow-y-auto">
                      <h3 className="font-bold text-gray-900 dark:text-white">Terms of Service</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">By using NexusChat, you agree to our terms. We provide a platform for real-time messaging...</p>
                      <h3 className="font-bold text-gray-900 dark:text-white mt-4">Privacy Policy</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Your privacy is important to us. We use end-to-end encryption for all messages...</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Last updated: Oct 2023</p>
                  </div>
              </div>
          );
      case 'app-info':
          return (
              <div className="animate-pop-in px-4 pb-4">
                  <SettingsHeader title="App Info" onBack={() => setSettingsView('help')} />
                  <div className="bg-white dark:bg-dark-hover rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700/50 flex flex-col items-center text-center">
                       <div className="w-24 h-24 bg-gradient-to-tr from-nexus-400 to-nexus-600 rounded-3xl rotate-3 mb-6 flex items-center justify-center shadow-lg">
                          <svg className="w-12 h-12 text-white transform -rotate-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                       </div>
                       <h2 className="text-2xl font-bold text-gray-900 dark:text-white">NexusChat</h2>
                       <p className="text-gray-500 dark:text-gray-400 font-medium mb-6">Version 2.5.0 (Beta)</p>
                       <p className="text-gray-400 text-sm">© 2024 Nexus Inc. All rights reserved.</p>
                  </div>
              </div>
          );
      case 'chats':
        return (
          <div className="animate-pop-in px-4 pb-4">
            <SettingsHeader title="Chats" onBack={() => setSettingsView('main')} />
            <div className="bg-white dark:bg-dark-hover rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50 space-y-6">
                 <div className="flex items-center justify-between">
                    <span className="text-gray-800 dark:text-gray-200 font-medium">App Theme</span>
                    <button onClick={onToggleTheme} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-dark-input px-4 py-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition ring-1 ring-gray-200 dark:ring-gray-700">
                       {currentTheme === 'light' ? <><span className="font-semibold">Light Mode</span><div className="w-3 h-3 bg-yellow-400 rounded-full shadow-sm ring-2 ring-white"></div></> : <><span className="font-semibold">Dark Mode</span><div className="w-3 h-3 bg-indigo-500 rounded-full shadow-sm ring-2 ring-indigo-300"></div></>}
                    </button>
                 </div>
                 
                 <div className="flex items-center justify-between">
                    <span className="text-gray-800 dark:text-gray-200 font-medium">Navbar Position</span>
                    <button onClick={onToggleNavPosition} className="text-sm font-semibold bg-gray-100 dark:bg-dark-input px-4 py-2 rounded-full text-nexus-600 dark:text-nexus-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                       {navPosition === 'top' ? 'Top' : 'Bottom'}
                    </button>
                 </div>

                 <div>
                    <span className="text-gray-800 dark:text-gray-200 block mb-3 font-medium">Wallpaper</span>
                    <div className="flex space-x-3 overflow-x-auto pb-4 scrollbar-hide">
                       {WALLPAPERS.map((wp, i) => (
                         <div key={i} onClick={() => onWallpaperChange(wp)} className={`w-16 h-24 rounded-xl border-2 cursor-pointer shadow-sm transition-all transform hover:scale-105 active:scale-95 bg-cover bg-center ${currentWallpaper === wp ? 'border-nexus-500 ring-2 ring-nexus-200' : 'border-transparent hover:border-nexus-300'}`} style={{ backgroundImage: `url(${wp})` }}></div>
                       ))}
                    </div>
                 </div>
                 <div className="pt-2 space-y-2">
                    <button onClick={onClearChats} className="flex items-center space-x-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition w-full py-3 px-4 rounded-xl">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                       <span className="font-medium">Clear All Chats</span>
                    </button>
                 </div>
            </div>
          </div>
        );
      default:
        // Default View implementation similar to before...
        return (
          <div className="p-4 space-y-6 animate-pop-in">
             {/* ... Account Card ... */}
            <div className="flex items-center space-x-4 mb-6 cursor-pointer bg-white dark:bg-dark-hover p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition group" onClick={() => setSettingsView('account')}>
               <img src={currentUser.avatar} className="w-16 h-16 rounded-full object-cover border-2 border-nexus-100 dark:border-gray-600 group-hover:scale-105 transition-transform duration-300" />
               <div className="flex-1 min-w-0">
                 <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">{currentUser.name}</h2>
                 <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{currentUser.bio}</p>
                 <span className="inline-flex items-center mt-1.5 px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs rounded-full font-semibold">Online</span>
               </div>
               <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
            
            <div className="space-y-2">
              {[
                { id: 'account', name: 'Account', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0z' },
                { id: 'chats', name: 'Chats', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
                { id: 'privacy', name: 'Privacy', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
                { id: 'notifications', name: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
                { id: 'storage', name: 'Storage & Data', icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4' },
                { id: 'help', name: 'Help', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
              ].map(item => (
                <button key={item.id} onClick={() => setSettingsView(item.id as SettingsView)} className="w-full flex items-center p-3.5 bg-white dark:bg-dark-hover hover:bg-gray-50 dark:hover:bg-gray-700/70 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 transition group">
                   <div className="p-2.5 bg-gray-50 dark:bg-gray-700 rounded-full mr-4 text-nexus-600 dark:text-nexus-400 group-hover:bg-nexus-50 dark:group-hover:bg-nexus-900/30 transition-colors">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                   </div>
                   <span className="flex-1 text-left text-gray-800 dark:text-gray-100 font-semibold">{item.name}</span>
                   <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              ))}
            </div>
          </div>
        );
    }
  };

  const TabBar = () => (
    <div className="px-5 mb-2 shrink-0 z-20">
       <div className="flex bg-gray-200/60 dark:bg-gray-800/60 p-1.5 rounded-xl">
          {[
            { id: 'chats', label: 'Chats' },
            { id: 'status', label: 'Status' },
            { id: 'calls', label: 'Calls' }
          ].map(tab => (
            <button key={tab.id} onClick={() => onTabChange(tab.id as any)} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${activeTab === tab.id ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
              {tab.label}
            </button>
          ))}
       </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-dark-bg border-r border-gray-200 dark:border-gray-700 w-full md:w-full transition-colors duration-300">
      {/* Header */}
      <div className="p-5 flex justify-between items-center shrink-0 bg-gray-50 dark:bg-dark-bg z-20">
        <div className="flex items-center space-x-3" onClick={() => { onTabChange('settings'); setSettingsView('main'); }}>
          <div className="relative cursor-pointer group">
             <img src={currentUser.avatar} alt="Me" className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-700 shadow-sm group-hover:scale-105 transition-transform" />
             <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">NexusChat</span>
        </div>
        <div className="flex space-x-2">
            <button onClick={() => { onTabChange('settings'); setSettingsView('main'); }} className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
        </div>
      </div>

      {navPosition === 'top' && <TabBar />}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide px-3 pb-4">
        {activeTab === 'chats' && (
          <>
            <div className="px-2 mb-4 sticky top-0 z-10 pt-2 bg-gray-50 dark:bg-dark-bg pb-2">
              <div className="flex space-x-2">
                  <div className="relative group flex-1">
                    <span className="absolute left-3.5 top-3 text-gray-400 group-focus-within:text-nexus-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    </span>
                    <input type="text" placeholder="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-hover border border-gray-100 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nexus-400 text-gray-800 dark:text-gray-100 transition-all shadow-sm focus:shadow-md" />
                  </div>
                  <button onClick={() => setShowNewChatModal(true)} className="p-2.5 bg-white dark:bg-dark-hover border border-gray-100 dark:border-gray-700 rounded-xl text-nexus-600 dark:text-nexus-400 hover:shadow-md transition" title="New Chat">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  </button>
              </div>
            </div>
            
            <button onClick={() => setShowArchived(!showArchived)} className="w-full flex items-center justify-between px-4 py-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition mb-2">
                <div className="flex items-center space-x-3">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                   <span className="text-sm font-medium">Archived Chats</span>
                </div>
                <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{chats.filter(c => c.archived).length}</span>
            </button>

            <ul className="space-y-1">
              {filteredChats.map(chat => {
                const partner = getPartner(chat);
                const lastMsg = chat.messages[chat.messages.length - 1];
                const isActive = activeChatId === chat.id;
                return (
                  <li key={chat.id} onClick={() => onSelectChat(chat.id)} className={`px-4 py-3 cursor-pointer rounded-2xl transition-all duration-200 flex items-center space-x-3.5 group ${isActive ? 'bg-white dark:bg-dark-hover shadow-md scale-[1.02]' : 'hover:bg-white dark:hover:bg-dark-hover/50 hover:shadow-sm'}`}>
                    <div className="relative flex-shrink-0">
                      <img src={partner.avatar} alt="" className="w-12 h-12 rounded-full object-cover border border-gray-100 dark:border-gray-600 shadow-sm" />
                      {partner.status === 'online' && <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full shadow-sm"></span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <div className="flex items-center space-x-1.5">
                            <h3 className={`text-sm font-semibold truncate ${isActive ? 'text-nexus-700 dark:text-white' : 'text-gray-900 dark:text-gray-100'}`}>{partner.name}</h3>
                            {chat.muted && <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>}
                        </div>
                        {lastMsg && <span className={`text-[11px] font-medium ${chat.unreadCount > 0 ? 'text-nexus-600 dark:text-nexus-400' : 'text-gray-400'}`}>{formatDate(lastMsg.timestamp)}</span>}
                      </div>
                      <div className="flex justify-between items-center">
                          <p className={`text-sm truncate pr-2 ${chat.unreadCount > 0 ? 'font-semibold text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
                              {lastMsg ? (
                                lastMsg.isDeleted ? 
                                    <span className="italic flex items-center opacity-70"><svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>Deleted</span> 
                                    : (lastMsg.senderId === currentUser.id ? `You: ${lastMsg.content}` : lastMsg.content)
                              ) : <span className="text-nexus-500 italic">Draft</span>}
                          </p>
                          {chat.unreadCount > 0 && (
                              <span className="bg-gradient-to-r from-nexus-500 to-nexus-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[1.25rem] text-center shadow-md shadow-nexus-500/30">{chat.unreadCount}</span>
                          )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
        
        {/* Status Tab */}
        {activeTab === 'status' && (
          <div className="p-2 space-y-6">
            <div className="flex items-center space-x-4 cursor-pointer bg-white dark:bg-dark-hover p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition group" onClick={() => storyInputRef.current?.click()}>
              <input type="file" ref={storyInputRef} className="hidden" accept="image/*,video/*" onChange={handleStoryUpload} />
              <div className="relative">
                 <img src={currentUser.avatar} className="w-14 h-14 rounded-full object-cover opacity-90 border-2 border-gray-100 dark:border-gray-600" alt="My Status" />
                 <div className="absolute bottom-0 right-0 bg-nexus-500 text-white rounded-full w-5 h-5 flex items-center justify-center border-2 border-white dark:border-gray-800 text-sm font-bold shadow-sm transition group-hover:bg-nexus-600">+</div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100">My Status</h3>
                <p className="text-sm text-nexus-500 font-medium">Tap to add update</p>
              </div>
            </div>
            <div className="space-y-3">
               <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2">Recent Updates</h4>
               {Object.keys(storiesByUser).map(userId => {
                 const user = getUser(userId);
                 const userStories = storiesByUser[userId];
                 if(userStories.length === 0) return null;
                 const latestStory = userStories[userStories.length - 1];
                 return (
                   <div key={userId} onClick={() => onViewStory(latestStory.id)} className="flex items-center space-x-4 cursor-pointer group p-3 hover:bg-white dark:hover:bg-dark-hover rounded-2xl transition border border-transparent hover:border-gray-100 dark:hover:border-gray-700/50 hover:shadow-sm">
                     <div className="p-[2.5px] rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
                        <div className="bg-gray-50 dark:bg-dark-panel p-[2px] rounded-full">
                           <img src={user.avatar} className="w-12 h-12 rounded-full object-cover" alt={user.name} />
                        </div>
                     </div>
                     <div>
                       <h3 className="font-semibold text-gray-900 dark:text-gray-100">{user.name}</h3>
                       <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(latestStory.timestamp)}</p>
                     </div>
                   </div>
                 );
               })}
            </div>
          </div>
        )}

        {/* Calls Tab */}
        {activeTab === 'calls' && (
          <div className="px-2">
             <ul className="space-y-2">
               {callLogs.map(log => {
                 const user = getUser(log.userId);
                 return (
                   <li key={log.id} className="p-3 flex items-center justify-between bg-white dark:bg-dark-hover rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition">
                     <div className="flex items-center space-x-3.5">
                       <img src={user.avatar} className="w-12 h-12 rounded-full object-cover border border-gray-100 dark:border-gray-600" alt="" />
                       <div>
                         <h3 className={`font-semibold ${log.status === CallStatus.MISSED ? 'text-red-500' : 'text-gray-900 dark:text-gray-100'}`}>{user.name}</h3>
                         <div className="flex items-center space-x-1.5 text-sm font-medium text-gray-500 dark:text-gray-400">
                           {log.direction === 'outgoing' ? <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg> : <svg className={`w-3.5 h-3.5 ${log.status === CallStatus.MISSED ? 'text-red-500' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>}
                           <span>{formatDate(log.timestamp)}</span>
                         </div>
                       </div>
                     </div>
                     <button onClick={() => onStartCall(user.id, log.type)} className="p-2.5 text-nexus-600 dark:text-nexus-400 hover:bg-nexus-50 dark:hover:bg-gray-700 rounded-full transition border border-gray-100 dark:border-gray-600">
                       {log.type === 'video' ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
                     </button>
                   </li>
                 );
               })}
             </ul>
          </div>
        )}

        {activeTab === 'settings' && renderSettingsContent()}
      </div>

      {navPosition === 'bottom' && <TabBar />}

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-dark-panel rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[80vh] border border-gray-200 dark:border-gray-700">
                <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-dark-hover">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Start New Chat</h3>
                    <button onClick={() => setShowNewChatModal(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition text-gray-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="overflow-y-auto flex-1 p-2">
                    {users.filter(u => u.id !== currentUser.id).map(user => (
                        <button 
                            key={user.id}
                            onClick={() => { onCreateChat(user.id); setShowNewChatModal(false); }}
                            className="w-full p-3 flex items-center space-x-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl transition group"
                        >
                            <img src={user.avatar} className="w-12 h-12 rounded-full border border-gray-100 dark:border-gray-600 object-cover" alt="" />
                            <div className="text-left">
                                <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                            </div>
                        </button>
                    ))}
                    {users.length <= 1 && (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">No other contacts found.</div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
