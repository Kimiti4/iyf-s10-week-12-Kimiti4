import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { registerServiceWorker } from './utils/offlinePost'
import { initTelemetry } from './utils/telemetry'
import './index.css'
import './components/ErrorBoundary.css'

// Register service worker for PWA support
if ('serviceWorker' in navigator) {
  registerServiceWorker().catch(console.error)
}

initTelemetry()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)