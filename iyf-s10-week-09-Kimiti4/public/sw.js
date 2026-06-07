/**
 * 📱 Service Worker for JamiiLink PWA
 * Enables offline posts, caching, and background sync
 */

const CACHE_VERSION = 'jamii-v1'
const CACHE_NAME = `${CACHE_VERSION}-cache`
const API_CACHE = `${CACHE_VERSION}-api`
const IMAGE_CACHE = `${CACHE_VERSION}-images`

// Precache manifest (generated during build)
const PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json'
]

// Install event - precache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (!key.startsWith(CACHE_VERSION)) {
            return caches.delete(key)
          }
        })
      )
    ).then(() => self.clients.claim())
  )
})

// Fetch event - apply caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // API requests - Network First, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            caches.open(API_CACHE).then((cache) => cache.put(request, response.clone()))
          }
          return response
        })
        .catch(() => caches.match(request))
    )
    return
  }

  // Images - Cache First
  if (request.destination === 'image') {
    event.respondWith(
      caches.open(IMAGE_CACHE)
        .then((cache) => cache.match(request)
          .then((response) => {
            return response || fetch(request).then((resp) => {
              cache.put(request, resp.clone())
              return resp
            })
          })
        )
    )
    return
  }

  // Navigation - Cache First, fallback to network
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(request)
        .then((response) => response || fetch(request))
        .catch(() => caches.match('/offline.html'))
    )
    return
  }

  // Default - Network First
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()))
        }
        return response
      })
      .catch(() => caches.match(request))
  )
})

// Background Sync for offline posts
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-jamii-posts') {
    event.waitUntil(syncPendingPosts())
  }
})

// Message event - trigger sync from client
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SYNC_POSTS') {
    syncPendingPosts()
  }
})

// Sync pending posts with server
async function syncPendingPosts() {
  try {
    const db = await openIndexedDB()
    const tx = db.transaction('pendingPosts', 'readwrite')
    const store = tx.objectStore('pendingPosts')
    const posts = await store.getAll()

    for (const post of posts) {
      try {
        const response = await fetch('/api/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(post.token && { 'Authorization': `Bearer ${post.token}` })
          },
          body: JSON.stringify(post.data)
        })

        if (response.ok) {
          await store.delete(post.id)
          showNotification('Post published!', {
            body: 'Your offline post is now live 🎉',
            tag: `post-${post.id}`
          })
        } else {
          throw new Error(`HTTP ${response.status}`)
        }
      } catch (error) {
        post.retries = (post.retries || 0) + 1
        post.lastAttempt = Date.now()
        
        if (post.retries < 10 && Date.now() - post.createdAt < 48 * 60 * 60 * 1000) {
          await store.put(post)
        } else {
          await store.delete(post.id)
          showNotification('Post sync failed', {
            body: 'Please resubmit when online',
            tag: `failed-${post.id}`
          })
        }
      }
    }
  } catch (err) {
    console.error('Sync failed:', err)
  }
}

// Open IndexedDB helper
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('jamii-offline-db', 1)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// Show notification helper
function showNotification(title, options = {}) {
  if (self.Notification.permission === 'granted') {
    self.registration.showNotification(title, {
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      ...options
    })
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {}
  event.waitUntil(
    showNotification(data.title || 'JamiiLink', {
      body: data.body || 'New update!',
      ...data.options
    })
  )
})