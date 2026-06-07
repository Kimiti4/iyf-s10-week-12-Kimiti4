/**
 * 📱 PWA Hook - React integration for offline capabilities
 */

import { useState, useEffect } from 'react'
import { 
  queueOfflinePost, 
  getPendingPosts, 
  deletePendingPost, 
  isOnline,
  registerServiceWorker 
} from '../utils/offlinePost'

export const usePWA = () => {
  const [online, setOnline] = useState(isOnline())
  const [pendingPosts, setPendingPosts] = useState([])
  const [swRegistered, setSwRegistered] = useState(false)

  useEffect(() => {
    // Initialize
    const init = async () => {
      const registration = await registerServiceWorker()
      if (registration) setSwRegistered(true)
      const posts = await getPendingPosts()
      setPendingPosts(posts)
    }
    init()

    // Online/offline listeners
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const submitPost = async (postData, userToken) => {
    if (online) {
      try {
        const response = await fetch('/api/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(userToken && { 'Authorization': `Bearer ${userToken}` })
          },
          body: JSON.stringify(postData)
        })
        return { success: response.ok, online: true }
      } catch (err) {
        // Fallback to offline queue on error
        const id = await queueOfflinePost(postData, userToken)
        setPendingPosts([...pendingPosts, { id }])
        return { success: true, offline: true, id }
      }
    } else {
      const id = await queueOfflinePost(postData, userToken)
      setPendingPosts([...pendingPosts, { id }])
      return { success: true, offline: true, id }
    }
  }

  const removeFromQueue = async (postId) => {
    await deletePendingPost(postId)
    setPendingPosts(pendingPosts.filter(p => p.id !== postId))
  }

  return {
    online,
    pendingPosts,
    pendingCount: pendingPosts.length,
    submitPost,
    removeFromQueue,
    swRegistered
  }
}