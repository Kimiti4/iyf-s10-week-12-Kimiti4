/**
 * Community Chat — direct messages backed by the API.
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { formatRelativeTime } from '../utils/formatTime'
import { request } from '../services/apiClient'
import { initializeSocket } from '../services/socketClient'
import EmptyState from '../components/primitives/EmptyState'
import ErrorState from '../components/primitives/ErrorState'
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
      // Socket unavailable — REST remains functional
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
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h2>Messages</h2>
        </div>

        <div className="search-box">
          <input
            type="search"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search conversations"
          />
        </div>

        <div className="conversations-list">
          {status === LOADING && conversations.length === 0 && (
            <div className="chat-loading" role="status">Loading conversations…</div>
          )}
          {status === ERROR && (
            <ErrorState error={error} onRetry={loadConversations} />
          )}
          {status === LOADED && filteredConversations.length === 0 && (
            <EmptyState
              icon="💬"
              title="No conversations yet"
              message="Start one from another user's profile"
            />
          )}
          {filteredConversations.map(conv => (
            <button
              type="button"
              key={conv.id}
              className={`conversation-item ${String(selectedId) === String(conv.id) ? 'active' : ''}`}
              onClick={() => setSelectedId(conv.id)}
            >
              <div className="conv-avatar">
                <span aria-hidden="true">{conv.participant?.avatarIcon || '🦁'}</span>
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
            </button>
          ))}
        </div>
      </div>

      <div className="chat-main">
        {selectedConversation ? (
          <>
            <div className="chat-header">
              <div className="chat-participant-info">
                <div className="participant-avatar">
                  <span aria-hidden="true">{selectedConversation.participant?.avatarIcon || '🦁'}</span>
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
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="message-bubble">
                      <p>{msg.content}</p>
                      <span className="message-time">
                        {msg.createdAt
                          ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : ''}
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
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                aria-label="Message"
              />
              <button
                type="submit"
                className="btn-send btn btn-primary"
                disabled={!messageInput.trim() || sending}
                aria-label="Send message"
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="no-conversation-selected">
            <EmptyState
              icon="💬"
              title="Select a conversation"
              message="Pick a chat from the sidebar to start messaging"
            />
          </div>
        )}
      </div>
    </main>
  )
}

export default ChatPage
