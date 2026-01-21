import React, { useState, useRef, useEffect } from 'react';
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

const CourseChatbot = ({ courses }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your course assistant. I can help you find courses, answer questions about course content, or provide recommendations. What would you like to know?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = (userMessage) => {
    const message = userMessage.toLowerCase();

    // Simple keyword-based responses
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return "Hello! How can I help you with our courses today?";
    }

    if (message.includes('how many') && message.includes('course')) {
      return `We currently have ${courses.length} courses available.`;
    }

    if (message.includes('category') || message.includes('categories')) {
      const categories = [...new Set(courses.map(course => course.category))];
      return `We offer courses in these categories: ${categories.join(', ')}.`;
    }

    if (message.includes('recommend') || message.includes('suggest')) {
      const recommended = courses.filter(course => course.rating >= 4.5).slice(0, 3);
      if (recommended.length > 0) {
        return `Here are some highly-rated courses I recommend:\n${recommended.map(course => `• ${course.title} (${course.rating} stars)`).join('\n')}`;
      }
      return "I recommend checking out our top-rated courses!";
    }

    if (message.includes('price') || message.includes('cost') || message.includes('free')) {
      return "Currently, all our courses are free to enroll! You can start learning immediately.";
    }

    if (message.includes('level') || message.includes('beginner') || message.includes('advanced')) {
      const levels = ['beginner', 'intermediate', 'advanced'];
      const levelCounts = levels.map(level =>
        courses.filter(course => course.level === level).length
      );
      return `We have courses for all levels:\n• Beginner: ${levelCounts[0]} courses\n• Intermediate: ${levelCounts[1]} courses\n• Advanced: ${levelCounts[2]} courses`;
    }

    if (message.includes('coach') || message.includes('instructor')) {
      const coaches = [...new Set(courses.map(course =>
        `${course.coach?.firstName} ${course.coach?.lastName}`
      ))];
      return `Our courses are taught by experienced coaches: ${coaches.join(', ')}.`;
    }

    // Search for specific courses
    const matchingCourses = courses.filter(course =>
      course.title.toLowerCase().includes(message) ||
      course.description.toLowerCase().includes(message) ||
      course.category.toLowerCase().includes(message)
    );

    if (matchingCourses.length > 0) {
      return `I found ${matchingCourses.length} course(s) that might interest you:\n${matchingCourses.slice(0, 3).map(course => `• ${course.title} - ${course.description.substring(0, 100)}...`).join('\n')}`;
    }

    // Default responses
    const defaultResponses = [
      "I'd be happy to help you find the right course! Could you tell me more about what you're interested in?",
      "That's an interesting question! Let me help you explore our course offerings.",
      "I'm here to assist you with any questions about our courses. What specific information are you looking for?",
      "Feel free to ask me about course content, categories, levels, or recommendations!"
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: generateResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 z-50"
        aria-label="Open course chatbot"
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6" />
        ) : (
          <ChatBubbleLeftRightIcon className="w-6 h-6" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-96 h-[500px] bg-white dark:bg-dark-800 rounded-lg shadow-xl border border-gray-200 dark:border-dark-700 z-40 flex flex-col">
          {/* Header */}
          <div className="bg-primary-600 text-white p-4 rounded-t-lg">
            <h3 className="font-semibold">Course Assistant</h3>
            <p className="text-sm text-primary-100">Ask me anything about our courses!</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                    message.sender === 'user'
                      ? 'bg-primary-600 text-white rounded-br-sm'
                      : 'bg-gray-100 dark:bg-dark-700 text-gray-900 dark:text-gray-100 rounded-bl-sm'
                  }`}
                >
                  <p className="whitespace-pre-line">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-dark-700 px-3 py-2 rounded-lg rounded-bl-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-dark-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about courses..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dark-700 dark:text-gray-100"
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="p-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseChatbot;