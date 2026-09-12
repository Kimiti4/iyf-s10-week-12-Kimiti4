/**
 * 💬 Community Chat - Direct messages backed by the real API.
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { colors } from '../styles/designSystem'
import { formatRelativeTime } from '../utils/formatTime'
import { request } from '../services/apiClient'
import { initializeSocket } from '../services/socketClient'
import './ChatPage.css'

const IDLE = 'idle'
const LOADING = 'loading'
const LOADED = 'loaded'
const ERROR = 'error'

const ChatPage = () => {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [status, setStatus] = useState(IDLE)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const selectedIdRef = useRef(null)
  selectedIdRef.current = selectedId

  const loadConversations = useCallback(async () => {
    setStatus(LOADING)
    setError('')
    try {
      const res = await request('/messages/conversations')
      setConversations(res.data || [])
      setStatus(LOADED)
    } catch (err) {
      setError(err.message || 'Failed to load conversations')
      setStatus(ERROR)
    }
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) return
    try {
      const res = await request(`/messages/conversations/${conversationId}`)
      setMessages(res.data || [])
    } catch (err) {
      setError(err.message || 'Failed to load messages')
    }
  }, [])

  useEffect(() => {
    if (selectedId) loadMessages(selectedId)
    else setMessages([])
  }, [selectedId, loadMessages])

  // Realtime delivery on the existing Socket.IO infrastructure.
  // Dedupe against REST responses by message id.
  useEffect(() => {
    let cleanup = null
    try {
      const socket = initializeSocket()
      const onNew = (msg) => {
        if (!msg || String(msg.conversationId) !== String(selectedIdRef.current)) return
        setMessages((prev) => (prev.some((m) => String(m.id) === String(msg.id)) ? prev : [...prev, msg]))
      }
      socket.on('message:new', onNew)
      cleanup = () => socket.off('message:new', onNew)
    } catch {
      // Socket unavailable — REST polling via selection remains functional
    }
    return () => { if (cleanup) cleanup() }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!messageInput.trim() || !selectedId || sending) return
    setSending(true)
    try {
      const res = await request(`/messages/conversations/${selectedId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content: messageInput.trim() })
      })
      const sent = res.data
      // Dedupe: the socket echo of this same message may arrive separately
      setMessages((prev) => (prev.some((m) => String(m.id) === String(sent.id)) ? prev : [...prev, sent]))
      setMessageInput('')
      setConversations((prev) => prev.map((c) =>
        String(c.id) === String(selectedId)
          ? { ...c, lastMessage: sent.content, lastMessageAt: sent.createdAt }
          : c
      ))
    } catch (err) {
      setError(err.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const filteredConversations = conversations.filter((conv) =>
    (conv.participant?.username || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedConversation = conversations.find((c) => String(c.id) === String(selectedId)) || null

  return (
    <main className="chat-page" role="main" aria-label="Chat">
      <motion.div
        className="chat-sidebar"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        <div className="sidebar-header">
          <h2>💬 Messages</h2>
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
          {status === LOADING && conversations.length === 0 && (
            <div className="chat-loading">Loading conversations…</div>
          )}
          {status === ERROR && (
            <div className="chat-error" role="alert">
              {error}
              <button onClick={loadConversations}>Try again</button>
            </div>
          )}
          {status === LOADED && filteredConversations.length === 0 && (
            <div className="chat-empty">
              <p>No conversations yet.</p>
              <p>Start one from another user's profile.</p>
            </div>
          )}
          {filteredConversations.map(conv => (
            <motion.div
              key={conv.id}
              className={`conversation-item ${String(selectedId) === String(conv.id) ? 'active' : ''}`}
              onClick={() => setSelectedId(conv.id)}
              whileHover={{ backgroundColor: colors.primary[50] }}
            >
              <div className="conv-avatar">
                <span>{conv.participant?.avatarIcon || '🦁'}</span>
              </div>

              <div className="conv-info">
                <div className="conv-header">
                  <h3>{conv.participant?.username || 'Unknown'}</h3>
                  {conv.lastMessageAt && (
                    <span className="conv-time">{formatRelativeTime(conv.lastMessageAt)}</span>
                  )}
                </div>
                <p className="conv-last-message">{conv.lastMessage || ''}</p>
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
                  <span>{selectedConversation.participant?.avatarIcon || '🦁'}</span>
                </div>
                <div>
                  <h3>{selectedConversation.participant?.username || 'Unknown'}</h3>
                </div>
              </div>
            </div>

            <div className="messages-container">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    className={`message ${String(msg.senderId) === String(user?.id) ? 'sent' : 'received'}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="message-bubble">
                      <p>{msg.content}</p>
                      <span className="message-time">
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
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
                disabled={!messageInput.trim() || sending}
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
