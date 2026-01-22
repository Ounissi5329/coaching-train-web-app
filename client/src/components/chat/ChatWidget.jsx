import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { messageAPI, userAPI } from '../../services/api';
import { initSocket, joinRoom, onReceiveMessage, sendMessage as emitMessage } from '../../services/socket';
import { format } from 'date-fns';
import {
  XMarkIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  MinusIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const ChatWidget = () => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [view, setView] = useState('contacts'); // 'contacts', 'conversations', 'chat'
  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && isOpen) {
      fetchConversations();
      fetchContacts();
      const socket = initSocket();
      onReceiveMessage((data) => {
        if (selectedConv && data.conversationId === selectedConv.conversationId) {
          setMessages(prev => [...prev, data]);
        }
        fetchConversations();
      });
    }
  }, [isAuthenticated, isOpen, selectedConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await messageAPI.getConversations();
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchContacts = async () => {
    try {
      // Fetch coaches if user is client, or clients if user is coach
      let response;
      if (user.role === 'client') {
        response = await userAPI.getCoaches({ limit: 100 });
        setContacts(response.data.coaches || response.data);
      } else {
        response = await userAPI.getClients();
        setContacts(response.data);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const handleSelectUser = async (targetUser) => {
    setLoading(true);
    setView('chat');
    setIsMinimized(false);
    
    // Check if conversation already exists
    const existingConv = conversations.find(c => c.otherUser._id === targetUser._id);
    
    try {
      const response = await messageAPI.getConversation(targetUser._id);
      setMessages(response.data);
      
      const convId = existingConv ? existingConv.conversationId : [user._id, targetUser._id].sort().join('_');
      
      setSelectedConv({
        conversationId: convId,
        otherUser: targetUser
      });
      
      joinRoom(convId);
    } catch (error) {
      console.error('Error starting chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv) return;

    try {
      const response = await messageAPI.sendMessage({
        receiverId: selectedConv.otherUser._id,
        content: newMessage
      });

      const messageData = {
        ...response.data,
        roomId: selectedConv.conversationId,
        conversationId: selectedConv.conversationId
      };

      emitMessage(messageData);
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!isAuthenticated) return null;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-all z-50 flex items-center gap-2"
      >
        <ChatBubbleLeftRightIcon className="w-6 h-6" />
        <span className="font-medium">Chat</span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-0 right-6 w-80 bg-white dark:bg-dark-900 shadow-2xl z-50 flex flex-col border border-gray-200 dark:border-dark-700 rounded-t-xl transition-all duration-300 ${isMinimized ? 'h-14' : 'h-[500px]'}`}>
      {/* Header */}
      <div className="p-3 border-b border-gray-100 dark:border-dark-800 flex items-center justify-between bg-primary-600 text-white rounded-t-xl cursor-pointer" onClick={() => isMinimized && setIsMinimized(false)}>
        <div className="flex items-center gap-2 flex-1">
          {view === 'chat' && !isMinimized && (
            <button onClick={(e) => { e.stopPropagation(); setView('contacts'); }} className="p-1 hover:bg-primary-700 rounded">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h2 className="font-bold text-sm truncate">
            {isMinimized ? 'Chat' : (view === 'chat' ? `${selectedConv?.otherUser?.firstName} ${selectedConv?.otherUser?.lastName}` : 'Messages')}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="p-1 hover:bg-primary-700 rounded">
            {isMinimized ? <ChevronUpIcon className="w-4 h-4" /> : <MinusIcon className="w-4 h-4" />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="p-1 hover:bg-primary-700 rounded">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Tabs */}
          {view !== 'chat' && (
            <div className="flex border-b border-gray-100 dark:border-dark-800">
              <button 
                onClick={() => setView('contacts')}
                className={`flex-1 py-2 text-xs font-medium ${view === 'contacts' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`}
              >
                Contacts
              </button>
              <button 
                onClick={() => setView('conversations')}
                className={`flex-1 py-2 text-xs font-medium ${view === 'conversations' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`}
              >
                Recent
              </button>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-dark-900">
            {view === 'contacts' ? (
              <div className="p-2 space-y-1">
                <div className="relative mb-2">
                  <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                {contacts
                  .filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(contact => (
                    <button
                      key={contact._id}
                      onClick={() => handleSelectUser(contact)}
                      className="w-full p-2 flex items-center gap-3 hover:bg-white dark:hover:bg-dark-800 rounded-lg transition-colors text-left"
                    >
                      {contact.avatar ? (
                        <img src={contact.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                          <UserIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {contact.firstName} {contact.lastName}
                      </span>
                    </button>
                  ))}
              </div>
            ) : view === 'conversations' ? (
              <div className="divide-y divide-gray-100 dark:divide-dark-800">
                {conversations.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p className="text-xs">No recent chats</p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.conversationId}
                      onClick={() => handleSelectUser(conv.otherUser)}
                      className="w-full p-3 flex items-center gap-3 hover:bg-white dark:hover:bg-dark-800 transition-colors text-left"
                    >
                      <div className="relative">
                        {conv.otherUser.avatar ? (
                          <img src={conv.otherUser.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                          </div>
                        )}
                        {conv.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-dark-900">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {conv.otherUser.firstName}
                          </p>
                          <span className="text-[10px] text-gray-500">
                            {format(new Date(conv.lastMessage.createdAt), 'MMM d')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {conv.lastMessage.content}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            ) : (
              <div className="flex flex-col h-full bg-white dark:bg-dark-900">
                <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                  {loading ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isOwn = msg.sender._id === user._id || msg.sender === user._id;
                      return (
                        <div key={msg._id || idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] p-2 rounded-xl text-xs ${
                            isOwn ? 'bg-primary-600 text-white rounded-br-none' : 'bg-gray-100 dark:bg-dark-800 text-gray-900 dark:text-gray-100 rounded-bl-none'
                          }`}>
                            <p>{msg.content}</p>
                            <p className={`text-[9px] mt-1 opacity-70 ${isOwn ? 'text-right' : 'text-left'}`}>
                              {format(new Date(msg.createdAt), 'h:mm a')}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                <form onSubmit={handleSend} className="p-3 border-t border-gray-100 dark:border-dark-800">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-full px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 dark:text-white"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="p-1.5 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 transition-colors"
                    >
                      <PaperAirplaneIcon className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ChatWidget;