/**
 * 💬 Chat Feature - Real-time Messaging System
 * Features: Conversations, Messages, Online Status, Typing Indicators
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import './ChatPage.css';

const ChatPage = () => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  // Mock conversations data
  const [conversations, setConversations] = useState([
    {
      id: 1,
      participant: {
        id: 2,
        name: 'Jane Doe',
        avatar: null,
        online: true,
        lastSeen: 'Online'
      },
      lastMessage: 'Hey! How are you doing?',
      unreadCount: 3,
      timestamp: Date.now() - 3600000,
      messages: [
        { id: 1, senderId: 2, text: 'Hi there!', timestamp: Date.now() - 7200000 },
        { id: 2, senderId: user?.id || 1, text: 'Hello! How are you?', timestamp: Date.now() - 7100000 },
        { id: 3, senderId: 2, text: 'I\'m great! Working on a new project.', timestamp: Date.now() - 3600000 },
      ]
    },
    {
      id: 2,
      participant: {
        id: 3,
        name: 'Tech Hub Nairobi',
        avatar: null,
        online: false,
        lastSeen: '2 hours ago'
      },
      lastMessage: 'The event was amazing!',
      unreadCount: 0,
      timestamp: Date.now() - 86400000,
      messages: [
        { id: 1, senderId: 3, text: 'Thanks for coming to our event!', timestamp: Date.now() - 172800000 },
        { id: 2, senderId: user?.id || 1, text: 'It was fantastic!', timestamp: Date.now() - 86400000 },
      ]
    },
    {
      id: 3,
      participant: {
        id: 4,
        name: 'Community Leader',
        avatar: null,
        online: true,
        lastSeen: 'Online'
      },
      lastMessage: 'Let\'s schedule a meeting',
      unreadCount: 1,
      timestamp: Date.now() - 172800000,
      messages: [
        { id: 1, senderId: 4, text: 'Can we meet tomorrow?', timestamp: Date.now() - 259200000 },
        { id: 2, senderId: user?.id || 1, text: 'Sure, what time works for you?', timestamp: Date.now() - 172800000 },
      ]
    }
  ]);

  const filteredConversations = conversations.filter(conv => 
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversation) return;

    const newMessage = {
      id: Date.now(),
      senderId: user?.id || 1,
      text: messageInput,
      timestamp: Date.now()
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessage: messageInput,
          timestamp: Date.now()
        };
      }
      return conv;
    }));

    setMessageInput('');
    
    // Simulate reply after 2 seconds
    setTimeout(() => {
      const replyMessage = {
        id: Date.now() + 1,
        senderId: selectedConversation.participant.id,
        text: 'Thanks for your message! 👍',
        timestamp: Date.now()
      };

      setConversations(prev => prev.map(conv => {
        if (conv.id === selectedConversation.id) {
          return {
            ...conv,
            messages: [...conv.messages, replyMessage],
            lastMessage: replyMessage.text,
            timestamp: Date.now()
          };
        }
        return conv;
      }));
    }, 2000);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="chat-page">
      {/* Sidebar - Conversations List */}
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h2>💬 Messages</h2>
          <button className="btn-new-chat">+</button>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="conversations-list">
          {filteredConversations.map((conv) => (
            <motion.div
              key={conv.id}
              className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
              onClick={() => setSelectedConversation(conv)}
              whileHover={{ scale: 1.02 }}
            >
              <div className="conv-avatar">
                {conv.participant.avatar ? (
                  <img src={conv.participant.avatar} alt={conv.participant.name} />
                ) : (
                  <span>{conv.participant.name.charAt(0)}</span>
                )}
                {conv.participant.online && <div className="online-indicator"></div>}
              </div>
              
              <div className="conv-info">
                <div className="conv-header">
                  <h3>{conv.participant.name}</h3>
                  <span className="conv-time">{formatTime(conv.timestamp)}</span>
                </div>
                <p className="conv-last-message">{conv.lastMessage}</p>
              </div>

              {conv.unreadCount > 0 && (
                <div className="unread-badge">{conv.unreadCount}</div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-main">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-participant-info">
                <div className="participant-avatar">
                  {selectedConversation.participant.avatar ? (
                    <img src={selectedConversation.participant.avatar} alt="" />
                  ) : (
                    <span>{selectedConversation.participant.name.charAt(0)}</span>
                  )}
                  {selectedConversation.participant.online && (
                    <div className="online-indicator large"></div>
                  )}
                </div>
                <div className="participant-details">
                  <h3>{selectedConversation.participant.name}</h3>
                  <span className="participant-status">
                    {selectedConversation.participant.online ? '🟢 Online' : `Last seen ${selectedConversation.participant.lastSeen}`}
                  </span>
                </div>
              </div>
              <div className="chat-actions">
                <button className="btn-action" title="Voice Call">📞</button>
                <button className="btn-action" title="Video Call">📹</button>
                <button className="btn-action" title="More Options">⋮</button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="messages-container">
              <AnimatePresence>
                {selectedConversation.messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    className={`message ${msg.senderId === (user?.id || 1) ? 'sent' : 'received'}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="message-bubble">
                      <p>{msg.text}</p>
                      <span className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form className="message-input-area" onSubmit={handleSendMessage}>
              <button type="button" className="btn-attach">📎</button>
              <input
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
              />
              <button type="button" className="btn-emoji">😊</button>
              <button type="submit" className="btn-send" disabled={!messageInput.trim()}>
                ➤
              </button>
            </form>
          </>
        ) : (
          <div className="no-conversation-selected">
            <div className="empty-state">
              <span className="empty-icon">💬</span>
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
