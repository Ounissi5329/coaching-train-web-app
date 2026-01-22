import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { messageAPI, userAPI } from '../../services/api';
import { initSocket, joinRoom, onReceiveMessage, sendMessage as emitMessage } from '../../services/socket';
import { format } from 'date-fns';
import {
  XMarkIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const ChatDrawer = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('list'); // 'list' or 'chat'
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
      const socket = initSocket();
      onReceiveMessage((data) => {
        if (selectedConv && data.conversationId === selectedConv.conversationId) {
          setMessages(prev => [...prev, data]);
        }
        fetchConversations();
      });
    }
  }, [isOpen, selectedConv]);

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

  const handleSelectConversation = async (conv) => {
    setSelectedConv(conv);
    setView('chat');
    setLoading(true);
    try {
      const response = await messageAPI.getConversation(conv.otherUser._id);
      setMessages(response.data);
      joinRoom(conv.conversationId);
    } catch (error) {
      console.error('Error fetching messages:', error);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-dark-900 shadow-2xl z-[60] flex flex-col border-l border-gray-200 dark:border-dark-700 transition-transform duration-300 transform translate-x-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-dark-800 flex items-center justify-between bg-primary-600 text-white">
        <div className="flex items-center gap-2">
          {view === 'chat' && (
            <button onClick={() => setView('list')} className="p-1 hover:bg-primary-700 rounded">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h2 className="font-bold">
            {view === 'list' ? 'Messages' : `${selectedConv?.otherUser?.firstName} ${selectedConv?.otherUser?.lastName}`}
          </h2>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-primary-700 rounded">
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {view === 'list' ? (
          <div className="divide-y divide-gray-100 dark:divide-dark-800">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>No conversations yet</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.conversationId}
                  onClick={() => handleSelectConversation(conv)}
                  className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors text-left"
                >
                  <div className="relative">
                    {conv.otherUser.avatar ? (
                      <img src={conv.otherUser.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
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
                      <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {conv.otherUser.firstName} {conv.otherUser.lastName}
                      </p>
                      <span className="text-[10px] text-gray-500">
                        {format(new Date(conv.lastMessage.createdAt), 'MMM d')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {conv.lastMessage.content}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isOwn = msg.sender._id === user._id || msg.sender === user._id;
                  return (
                    <div key={msg._id || idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                        isOwn ? 'bg-primary-600 text-white rounded-br-none' : 'bg-gray-100 dark:bg-dark-800 text-gray-900 dark:text-gray-100 rounded-bl-none'
                      }`}>
                        <p>{msg.content}</p>
                        <p className={`text-[10px] mt-1 opacity-70 ${isOwn ? 'text-right' : 'text-left'}`}>
                          {format(new Date(msg.createdAt), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSend} className="p-4 border-t border-gray-100 dark:border-dark-800 bg-gray-50 dark:bg-dark-900">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatDrawer;