/**
 * 📱 PWA Install Prompt Component
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      await deferredPrompt.userChoice
      setDeferredPrompt(null)
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          className="install-prompt"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
        >
          <span>📱 Install JamiiLink for offline access!</span>
          <div>
            <button onClick={handleInstall}>Install</button>
            <button onClick={handleDismiss} style={{ marginLeft: '8px', background: 'none', color: '#666' }}>
              Later
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}