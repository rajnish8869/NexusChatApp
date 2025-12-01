
import React, { useState, useRef, useEffect } from 'react';
import { Chat, Message, MessageType, MessageStatus, User, CallType } from '../types';
import { generateSmartReplies } from '../services/geminiService';
import { DEFAULT_WALLPAPER } from '../constants';

interface ChatWindowProps {
  chat: Chat | null;
  currentUser: User;
  onSendMessage: (text: string, type: MessageType, mediaUrl?: string) => void;
  onBack: () => void;
  onStartCall: (type: CallType) => void;
  onReact: (messageId: string, emoji: string) => void;
  onEdit: (messageId: string, newContent: string) => void;
}

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
  chat, 
  onSendMessage, 
  onBack,
  onStartCall,
  onReact,
  onEdit,
  currentUser 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  // States for interactive features
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [showReactionMenuId, setShowReactionMenuId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingTimerRef = useRef<any>(null);
  const longPressTimerRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    setSmartReplies([]); 
    setSelectedMessageId(null);
  }, [chat?.id]);

  useEffect(() => {
    // Only scroll if not editing to prevent jumping
    if (!editingMessageId) {
      scrollToBottom();
    }
  }, [chat?.messages, editingMessageId]);

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue, MessageType.TEXT);
      setInputValue('');
      setSmartReplies([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      let type = MessageType.DOCUMENT;
      if (file.type.startsWith('image/')) type = MessageType.IMAGE;
      if (file.type.startsWith('video/')) type = MessageType.VIDEO;
      if (file.type.startsWith('audio/')) type = MessageType.AUDIO;
      
      onSendMessage(file.name, type, url);
      setShowAttachments(false);
    }
  };

  const triggerSmartReply = async () => {
    if (!chat) return;
    setLoadingAI(true);
    const suggestions = await generateSmartReplies(chat.messages);
    setSmartReplies(suggestions);
    setLoadingAI(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      clearInterval(recordingTimerRef.current);
      setIsRecording(false);
      setRecordingDuration(0);
      onSendMessage("Voice Message", MessageType.AUDIO, "mock_audio_blob");
    } else {
      // Start recording
      setIsRecording(true);
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(d => d + 1);
      }, 1000);
    }
  };

  const startEditing = (msg: Message) => {
    setEditingMessageId(msg.id);
    setEditContent(msg.content);
    setShowReactionMenuId(null);
    setSelectedMessageId(null); // Deselect when editing starts
  };

  const saveEdit = (msgId: string) => {
    if (editContent.trim()) {
      onEdit(msgId, editContent);
    }
    setEditingMessageId(null);
    setEditContent('');
  };

  // Long Press Handlers
  const handlePressStart = (id: string) => {
    longPressTimerRef.current = setTimeout(() => {
      // Toggle selection after 2 seconds
      setSelectedMessageId(prev => (prev === id ? null : id));
    }, 2000);
  };

  const handlePressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-dark-bg h-full">
        <div className="text-center text-gray-400">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          </div>
          <p className="text-xl font-medium">NexusChat for Web</p>
          <p className="mt-2 text-sm">Send and receive messages without keeping your phone online.</p>
        </div>
      </div>
    );
  }

  const partner = chat.participants.find(p => p.id !== currentUser.id) || chat.participants[0];

  return (
    <div className="flex flex-col h-full relative" style={{ backgroundImage: `url(${chat.wallpaper || DEFAULT_WALLPAPER})`, backgroundSize: 'cover' }}>
      {/* Overlay for dark mode readability if needed */}
      <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/95 pointer-events-none z-0"></div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-sm z-10">
        <div className="flex items-center cursor-pointer">
          <button onClick={onBack} className="md:hidden mr-2 text-gray-500 hover:text-nexus-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="relative">
            <img src={partner.avatar} alt={partner.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
            {partner.status === 'online' && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            )}
          </div>
          <div className="ml-3">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 leading-tight">{partner.name}</h3>
            <p className="text-xs text-nexus-600 dark:text-nexus-400 font-medium">
              {partner.status === 'online' ? 'Online' : partner.status === 'busy' ? 'Busy' : `Last seen ${partner.lastSeen.toLocaleTimeString()}`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-nexus-600 dark:text-nexus-400">
          <button onClick={() => onStartCall(CallType.AUDIO)} className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
          </button>
          <button onClick={() => onStartCall(CallType.VIDEO)} className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          </button>
          <button className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full transition">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
          <button className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 z-0">
        <div className="flex justify-center my-4">
          <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-3 py-1 rounded-full shadow-sm">
            Messages are end-to-end encrypted
          </span>
        </div>

        {chat.messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          const isHovered = hoveredMessageId === msg.id;
          const isSelected = selectedMessageId === msg.id;
          const showMenu = showReactionMenuId === msg.id;
          const isEditing = editingMessageId === msg.id;
          
          const showToolbar = (isHovered || showMenu || isSelected) && !isEditing;

          return (
            <div 
              key={msg.id} 
              className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}
            >
              {/* Message Wrapper for relative positioning of actions */}
              <div 
                className="relative group max-w-[75%] md:max-w-[60%]"
                onMouseEnter={() => setHoveredMessageId(msg.id)}
                onMouseLeave={() => { 
                  setHoveredMessageId(null); 
                  if (!showReactionMenuId) setShowReactionMenuId(null); 
                  handlePressEnd();
                }}
                onMouseDown={() => handlePressStart(msg.id)}
                onMouseUp={handlePressEnd}
                onTouchStart={() => handlePressStart(msg.id)}
                onTouchEnd={handlePressEnd}
              >
                 {/* Quick Action Toolbar */}
                 <div className={`
                    absolute top-0 bottom-0 flex items-center
                    ${isMe ? 'right-full mr-2 flex-row-reverse space-x-reverse' : 'left-full ml-2'} 
                    space-x-1 transition-all duration-200 z-10
                    ${showToolbar ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'}
                 `}>
                     {/* React Button */}
                     <button 
                        onClick={(e) => { e.stopPropagation(); setShowReactionMenuId(showMenu ? null : msg.id); }}
                        className="p-1.5 rounded-full bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-nexus-600 dark:hover:text-nexus-400 transition shadow-sm border border-gray-100 dark:border-gray-600"
                        title="React"
                     >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     </button>
                     
                     {/* Reply Button */}
                     <button 
                        className="p-1.5 rounded-full bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-blue-500 transition shadow-sm border border-gray-100 dark:border-gray-600"
                        title="Reply"
                     >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                     </button>

                     {/* Forward Button */}
                     <button 
                        className="p-1.5 rounded-full bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-green-500 transition shadow-sm border border-gray-100 dark:border-gray-600"
                        title="Forward"
                     >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" /></svg>
                     </button>

                     {/* Edit Button (Only for own text messages) */}
                     {isMe && msg.type === MessageType.TEXT && (
                       <button 
                          onClick={() => startEditing(msg)}
                          className="p-1.5 rounded-full bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-orange-500 transition shadow-sm border border-gray-100 dark:border-gray-600"
                          title="Edit Message"
                       >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                       </button>
                     )}
                 </div>

                 {/* Reaction Popup Menu */}
                 {showMenu && (
                   <div className={`absolute bottom-full mb-2 ${isMe ? 'right-0' : 'left-0'} z-30 bg-white dark:bg-gray-800 rounded-full shadow-xl border border-gray-200 dark:border-gray-600 p-1 flex items-center space-x-1 animate-in zoom-in-95 duration-150 origin-bottom`}>
                      {REACTION_EMOJIS.map(emoji => (
                         <button 
                           key={emoji}
                           onClick={() => { onReact(msg.id, emoji); setShowReactionMenuId(null); }}
                           className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition hover:scale-125 text-xl leading-none"
                         >
                           {emoji}
                         </button>
                      ))}
                   </div>
                 )}

                {/* Message Bubble */}
                <div 
                  className={`rounded-2xl px-3 py-2 shadow-sm relative transition-all duration-200 ${
                    isMe 
                      ? 'bg-nexus-600 text-white rounded-tr-none' 
                      : 'bg-white dark:bg-dark-panel text-gray-800 dark:text-gray-200 rounded-tl-none'
                  } ${isSelected ? 'ring-2 ring-nexus-300 dark:ring-nexus-500 ring-offset-2 ring-offset-transparent' : ''}`}
                >
                  {/* Media Content */}
                  {msg.type === MessageType.IMAGE && msg.mediaUrl && (
                    <div className="mb-1 rounded-lg overflow-hidden cursor-pointer">
                      <img src={msg.mediaUrl} alt="Shared" className="w-full h-auto object-cover max-h-72" />
                    </div>
                  )}
                  
                  {msg.type === MessageType.VIDEO && msg.mediaUrl && (
                    <div className="mb-1 rounded-lg overflow-hidden bg-black flex justify-center items-center">
                      <video src={msg.mediaUrl} controls className="max-h-72 w-full" />
                    </div>
                  )}

                  {msg.type === MessageType.AUDIO && (
                    <div className="flex items-center space-x-3 min-w-[200px] py-2">
                       <button className={`p-2 rounded-full ${isMe ? 'bg-nexus-500' : 'bg-gray-200 dark:bg-gray-600'}`}>
                         <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                       </button>
                       <div className="flex-1">
                          <div className={`h-1 rounded-full ${isMe ? 'bg-nexus-400' : 'bg-gray-300 dark:bg-gray-600'}`}>
                             <div className="w-1/3 h-full bg-current rounded-full"></div>
                          </div>
                          <span className="text-xs opacity-70 mt-1 block">0:24</span>
                       </div>
                    </div>
                  )}
                  
                  {/* Text Content / Edit Mode */}
                  {msg.type === MessageType.TEXT && (
                    isEditing ? (
                      <div className="min-w-[200px]">
                        <input 
                          type="text" 
                          value={editContent} 
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full bg-white/20 dark:bg-black/20 rounded px-2 py-1 text-inherit focus:outline-none focus:ring-1 focus:ring-white/50"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(msg.id);
                            if (e.key === 'Escape') setEditingMessageId(null);
                          }}
                        />
                        <div className="flex justify-end space-x-2 mt-2">
                           <button onClick={() => setEditingMessageId(null)} className="text-xs opacity-80 hover:opacity-100">Cancel</button>
                           <button onClick={() => saveEdit(msg.id)} className="text-xs bg-white/20 px-2 py-0.5 rounded hover:bg-white/30 font-bold">Save</button>
                        </div>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap break-words text-[15px]">{msg.content}</p>
                    )
                  )}

                  {msg.type === MessageType.DOCUMENT && (
                     <div className="flex items-center space-x-3 p-2 bg-black/5 dark:bg-white/10 rounded-lg">
                        <svg className="w-8 h-8 opacity-70" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>
                        <div className="overflow-hidden">
                          <p className="truncate text-sm font-medium">{msg.content}</p>
                          <p className="text-xs opacity-70">PDF • 245 KB</p>
                        </div>
                     </div>
                  )}

                  {/* Footer: Time & Status */}
                  <div className={`flex items-center justify-end space-x-1 mt-1 text-[10px] ${isMe ? 'text-nexus-200' : 'text-gray-400'}`}>
                    {msg.isEdited && <span className="italic mr-1">Edited</span>}
                    <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isMe && (
                      <span>
                        {msg.status === MessageStatus.READ ? (
                          <span className="text-blue-300 font-bold">✓✓</span>
                        ) : msg.status === MessageStatus.DELIVERED ? (
                          <span className="text-nexus-200">✓✓</span>
                        ) : (
                          <span>✓</span>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Reactions Display */}
                  {msg.reactions.length > 0 && (
                     <div className="absolute -bottom-3 left-2 bg-white dark:bg-gray-700 rounded-full px-1.5 py-0.5 shadow-md border border-gray-100 dark:border-gray-600 flex space-x-1 text-xs text-gray-600 dark:text-gray-200 z-10 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600" onClick={() => setShowReactionMenuId(showMenu ? null : msg.id)}>
                       {msg.reactions.map((r, i) => (
                         <span key={i} className={r.userReacted ? 'bg-blue-100 dark:bg-blue-900/30 rounded px-1' : ''}>
                           {r.emoji} <span className="text-[10px]">{r.count > 1 ? r.count : ''}</span>
                         </span>
                       ))}
                     </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachments Menu */}
      {showAttachments && (
        <div className="absolute bottom-20 left-4 flex flex-col space-y-2 z-20 animate-in slide-in-from-bottom-5 fade-in duration-200">
           {[
             { type: 'image', color: 'bg-purple-500', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
             { type: 'document', color: 'bg-indigo-500', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
             { type: 'camera', color: 'bg-pink-500', icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' },
             { type: 'location', color: 'bg-green-500', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
             { type: 'contact', color: 'bg-blue-500', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
           ].map(item => (
             <button 
               key={item.type} 
               onClick={() => {
                 if (item.type === 'location') onSendMessage('Current Location', MessageType.LOCATION);
                 else fileInputRef.current?.click();
               }}
               className={`flex items-center space-x-3 p-3 rounded-full shadow-lg text-white hover:scale-110 transition ${item.color}`}
             >
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
             </button>
           ))}
        </div>
      )}

      {/* Smart Replies */}
      {smartReplies.length > 0 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto z-10 scrollbar-hide">
          {smartReplies.map((reply, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSendMessage(reply, MessageType.TEXT);
                setSmartReplies([]);
              }}
              className="bg-white/90 dark:bg-gray-700/90 backdrop-blur border border-nexus-200 dark:border-gray-600 text-nexus-700 dark:text-gray-200 px-4 py-1.5 rounded-full text-sm shadow-sm hover:bg-nexus-50 whitespace-nowrap transition"
            >
              ✨ {reply}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 bg-white dark:bg-dark-panel border-t border-gray-200 dark:border-gray-700 z-10">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowAttachments(!showAttachments)}
            className={`p-2 transition rounded-full ${showAttachments ? 'bg-gray-200 dark:bg-gray-600 rotate-45' : 'text-gray-500 hover:text-nexus-600'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            multiple
            onChange={handleFileUpload}
          />

          <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Message..."
              className="flex-1 bg-transparent text-gray-800 dark:text-gray-100 focus:outline-none placeholder-gray-500"
            />
            {/* AI Smart Reply Trigger */}
            <button 
              onClick={triggerSmartReply}
              disabled={loadingAI}
              className={`ml-2 text-nexus-600 hover:text-nexus-700 transition ${loadingAI ? 'animate-pulse' : ''}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
            </button>
          </div>

          {inputValue.trim() ? (
            <button 
              onClick={handleSend}
              className="p-3 bg-nexus-600 text-white rounded-full shadow-lg hover:bg-nexus-700 transition transform active:scale-95"
            >
              <svg className="w-5 h-5 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9-2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          ) : (
            <button 
              onMouseDown={toggleRecording}
              className={`p-3 rounded-full shadow-lg transition transform active:scale-110 ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-nexus-600 text-white hover:bg-nexus-700'}`}
            >
              {isRecording ? (
                 <span className="text-xs font-bold font-mono">{formatDuration(recordingDuration)}</span>
              ) : (
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
