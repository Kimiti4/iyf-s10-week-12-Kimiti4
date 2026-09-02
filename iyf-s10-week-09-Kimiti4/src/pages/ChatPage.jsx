/**
 * 💬 Community Chat - Let's Talk!
 */

import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { colors } from '../styles/designSystem'
import { formatRelativeTime } from '../utils/formatTime'
import './ChatPage.css'

const ChatPage = () => {
  const { user } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messageInput, setMessageInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef(null)

  const conversations = [
    {
      id: 1,
      participant: {
        id: 2,
        name: 'Jane Doe',
        avatar: null,
        online: true,
        emoji: '👩‍💻'
      },
      lastMessage: 'Hey! How are you doing?',
      unreadCount: 3,
      timestamp: Date.now() - 3600000,
      messages: [
        { id: 1, senderId: 2, text: 'Hi there! 👋', timestamp: Date.now() - 7200000 },
        { id: 2, senderId: user?.id || 1, text: 'Hello! How are you?', timestamp: Date.now() - 7100000 },
        { id: 3, senderId: 2, text: 'I\'m great! Want to join the skill swap quest? 🎯', timestamp: Date.now() - 3600000 },
      ]
    },
    {
      id: 2,
      participant: {
        id: 3,
        name: 'Tech Hub Nairobi',
        avatar: null,
        online: false,
        emoji: '💻'
      },
      lastMessage: 'The event was amazing! 🎉',
      unreadCount: 0,
      timestamp: Date.now() - 86400000,
      messages: [
        { id: 1, senderId: 3, text: 'Thanks for coming to our event! 🎪', timestamp: Date.now() - 172800000 },
        { id: 2, senderId: user?.id || 1, text: 'It was fantastic!', timestamp: Date.now() - 86400000 },
      ]
    }
  ]

  const filteredConversations = conversations.filter(conv => 
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!messageInput.trim() || !selectedConversation) return

    const response = {
      id: Date.now() + 1,
      senderId: selectedConversation.participant.id,
      text: 'Thanks for your message! 👍',
      timestamp: Date.now()
    }

    setSelectedConversation(prev => ({
      ...prev,
      messages: [...prev.messages, {
        id: Date.now(),
        senderId: user?.id || 1,
        text: messageInput,
        timestamp: Date.now()
      }, response]
    }))

    setMessageInput('')
  }

  return (
    <main className="chat-page" role="main" aria-label="Chat">
      <motion.div 
        className="chat-sidebar"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        <div className="sidebar-header">
          <h2>💬 Messages</h2>
          <motion.button className="btn-new-chat" whileHover={{ rotate: 90 }}>
            +
          </motion.button>
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
          {filteredConversations.map(conv => (
            <motion.div
              key={conv.id}
              className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
              onClick={() => setSelectedConversation(conv)}
              whileHover={{ backgroundColor: colors.primary[50] }}
            >
              <div className="conv-avatar">
                {conv.participant.avatar ? (
                  <img src={conv.participant.avatar} alt={conv.participant.name} />
                ) : (
                  <span>{conv.participant.emoji}</span>
                )}
                {conv.participant.online && <div className="online-indicator"></div>}
              </div>
              
              <div className="conv-info">
                <div className="conv-header">
                  <h3>{conv.participant.name}</h3>
                  <span className="conv-time">{formatRelativeTime(conv.timestamp)}</span>
                </div>
                <p className="conv-last-message">{conv.lastMessage}</p>
              </div>

              {conv.unreadCount > 0 && (
                <div className="unread-badge">{conv.unreadCount}</div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="chat-main">
        {selectedConversation ? (
          <>
            <div className="chat-header">
              <div className="chat-participant-info">
                <div className="participant-avatar">
                  {selectedConversation.participant.avatar ? (
                    <img src={selectedConversation.participant.avatar} alt="" />
                  ) : (
                    <span>{selectedConversation.participant.emoji}</span>
                  )}
                  {selectedConversation.participant.online && (
                    <div className="online-indicator large"></div>
                  )}
                </div>
                <div>
                  <h3>{selectedConversation.participant.name}</h3>
                  <span className="participant-status">
                    {selectedConversation.participant.online ? 'Online 🟢' : 'Offline ⚪'}
                  </span>
                </div>
              </div>
            </div>

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

            <form className="message-input-area" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Type a message... 💭"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
              />
              <motion.button 
                type="submit" 
                className="btn-send" 
                disabled={!messageInput.trim()}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                📤
              </motion.button>
            </form>
          </>
        ) : (
          <div className="no-conversation-selected">
            <div className="empty-state">
              <span className="empty-icon">💬</span>
              <h3>Select a conversation</h3>
              <p>Pick a chat from the sidebar to start messaging!</p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default ChatPage