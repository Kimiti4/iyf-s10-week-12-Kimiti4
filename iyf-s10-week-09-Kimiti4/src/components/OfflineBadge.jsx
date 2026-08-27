import { useEffect, useState } from 'react'
import { getPendingPosts } from '../utils/offlinePost'

export default function OfflineBadge() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let active = true
    const update = async () => {
      const posts = await getPendingPosts()
      if (active) setCount(posts.length)
    }
    const onServiceWorkerMessage = (event) => {
      if (event.data?.type === 'SYNC_COMPLETE') update()
    }

    update()
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    navigator.serviceWorker?.addEventListener('message', onServiceWorkerMessage)

    return () => {
      active = false
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
      navigator.serviceWorker?.removeEventListener('message', onServiceWorkerMessage)
    }
  }, [])

  if (count === 0) return null

  return <span className="offline-badge" aria-label={`${count} pending draft${count === 1 ? '' : 's'}`}>{count}</span>
}
