/**
 * 🔧 Offline Post Utility - For JamiiLink PWA
 * Enables offline post creation and background sync
 */

const DB_NAME = 'jamii-offline-db'
const DB_VERSION = 1
const STORE_NAME = 'pendingPosts'
const MAX_PENDING_POSTS = 20

const requestAsPromise = (request) => {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// Open IndexedDB
export const openOfflineDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('by-created', 'createdAt', { unique: false })
        store.createIndex('by-status', 'status', { unique: false })
      }
    }
    
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// Queue a post for offline submission
export const queueOfflinePost = async (postData, userToken = null) => {
  const postId = `offline_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  
  const pendingPost = {
    id: postId,
    data: {
      ...postData,
      createdAt: new Date().toISOString(),
      isOffline: true
    },
    token: userToken,
    createdAt: Date.now(),
    status: 'pending',
    retries: 0,
    lastAttempt: null
  }

  const db = await openOfflineDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)
  const count = await requestAsPromise(store.count())
  if (count >= MAX_PENDING_POSTS) {
    const oldest = await requestAsPromise(store.openCursor())
    if (oldest) await requestAsPromise(store.delete(oldest.primaryKey))
  }
  await requestAsPromise(store.add(pendingPost))
  
  // Request background sync if supported
  if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
    try {
      const registration = await navigator.serviceWorker.ready
      await registration.sync.register('sync-jamii-posts')
    } catch (err) {
      console.warn('Background sync registration failed:', err)
    }
  }
  
  // Fallback: listen for online event
  window.addEventListener('online', triggerSync, { once: true })
  
  return postId
}

// Get pending posts for UI display
export const getPendingPosts = async () => {
  try {
    const db = await openOfflineDB()
    const tx = db.transaction(STORE_NAME, 'readonly')
    return await tx.objectStore(STORE_NAME).getAll()
  } catch (err) {
    console.error('Failed to get pending posts:', err)
    return []
  }
}

// Delete a pending post
export const deletePendingPost = async (postId) => {
  const db = await openOfflineDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  await tx.objectStore(STORE_NAME).delete(postId)
}

// Clear all pending posts
export const clearPendingPosts = async () => {
  const db = await openOfflineDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  await tx.objectStore(STORE_NAME).clear()
}

// Trigger sync manually
export const triggerSync = async () => {
  if (!navigator.onLine) return

  const registration = await navigator.serviceWorker?.ready
  if (registration?.active) {
    registration.active.postMessage({ type: 'SYNC_POSTS' })
  }

  // Page-level fallback (works in dev / non-Chromium where Background Sync is absent)
  return flushPendingPosts()
}

/**
 * 🔄 Flush pending offline posts to the server.
 * Runs from the page (online event, /drafts screen) as a fallback that works
 * even when the service worker's Background Sync isn't available.
 * @returns {{ synced: number, failed: number }}
 */
export const flushPendingPosts = async () => {
  if (!navigator.onLine) return { synced: 0, failed: 0 }

  try {
    const db = await openOfflineDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const pending = await store.getAll()

    let synced = 0
    let failed = 0

    for (const post of pending) {
      try {
        const headers = { 'Content-Type': 'application/json' }
        if (post.token) headers.Authorization = `Bearer ${post.token}`
        const res = await fetch('/api/posts', {
          method: 'POST',
          headers,
          body: JSON.stringify(post.data),
        })
        post.retries = (post.retries || 0) + 1
        if (res.ok) {
          await store.delete(post.id)
          synced++
        } else {
          failed++
          if (post.retries >= 5) await store.delete(post.id)
        }
      } catch {
        post.retries = (post.retries || 0) + 1
        failed++
        if (post.retries >= 5) await store.delete(post.id)
      }
    }

    return { synced, failed }
  } catch (err) {
    console.error('Failed to flush pending posts:', err)
    return { synced: 0, failed: 0 }
  }
}

// Check if online
export const isOnline = () => navigator.onLine

// Register service worker
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('SW registered:', registration)
      return registration
    } catch (err) {
      console.error('SW registration failed:', err)
    }
  }
}

export default {
  queueOfflinePost,
  getPendingPosts,
  deletePendingPost,
  clearPendingPosts,
  triggerSync,
  flushPendingPosts,
  isOnline,
  registerServiceWorker
}