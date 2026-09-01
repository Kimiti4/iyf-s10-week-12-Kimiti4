/* ==========================================================================
   JamiiLink Service Worker — injectManifest strategy (via vite-plugin-pwa)
   Handles: app-shell precache, navigation fallback, and the offline draft
   queue background sync. This is the source of truth; dist/sw.js is built
   from this file, so editing public/sw.js has NO effect.
   ========================================================================== */
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { clientsClaim } from 'workbox-core'

self.skipWaiting()
clientsClaim()

// Precache the app shell + all built assets (manifest injected at build time)
precacheAndRoute(self.__WB_MANIFEST)

// SPA navigation fallback -> cached index.html
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')))
cleanupOutdatedCaches()

// Cache map tiles after first use so previously viewed areas remain available offline.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (!url.hostname.endsWith('openstreetmap.org') || !url.pathname.includes('/tile/')) return

  event.respondWith(
    caches.open('jamii-map-tiles').then(async (cache) => {
      const cached = await cache.match(event.request)
      if (cached) return cached

      try {
        const response = await fetch(event.request)
        if (response.ok) {
          await cache.put(event.request, response.clone())
          const keys = await cache.keys()
          if (keys.length > 500) await cache.delete(keys[0])
        }
        return response
      } catch {
        return new Response('Map tile unavailable offline', { status: 503 })
      }
    })
  )
})

/* ============================ OFFLINE DRAFT SYNC ============================ */
const DB_NAME = 'jamii-offline-db'
const STORE = 'pendingPosts'
const MAX_RETRIES = 5

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_POSTS') {
    event.waitUntil(processDraftQueue())
  }
})

// Chromium-only Background Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-jamii-posts') {
    event.waitUntil(processDraftQueue())
  }
})

async function processDraftQueue() {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)
    const drafts = await store.getAll()

    for (const draft of drafts) {
      try {
        const headers = { 'Content-Type': 'application/json' }
        if (draft.token) headers.Authorization = `Bearer ${draft.token}`
        const res = await fetch('/api/posts', {
          method: 'POST',
          headers,
          body: JSON.stringify(draft.data),
        })
        if (res.ok) {
          await store.delete(draft.id)
        } else {
          draft.retries = (draft.retries || 0) + 1
          if (draft.retries < MAX_RETRIES) await store.put(draft)
          else await store.delete(draft.id)
        }
      } catch (err) {
        draft.retries = (draft.retries || 0) + 1
        if (draft.retries < MAX_RETRIES) await store.put(draft)
        else await store.delete(draft.id)
      }
    }

    // Tell all open tabs the queue changed so the /drafts UI can refresh
    const clients = await self.clients.matchAll({ type: 'window' })
    clients.forEach((client) => client.postMessage({ type: 'SYNC_COMPLETE' }))
  } catch {
    // Draft sync failed silently
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}