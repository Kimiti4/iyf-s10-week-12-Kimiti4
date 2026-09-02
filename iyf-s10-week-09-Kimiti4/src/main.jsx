import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { initTelemetry } from './utils/telemetry'
import { initPerformanceTracking } from './performance'
import './styles/tokens.css'
import './styles/globals.css'
import './styles/AppShell.css'
import './styles/Navigation.css'
import './styles/Feed.css'
import './styles/Features.css'
import './styles/Trust.css'
import './styles/Analytics.css'
import './index.css'
import './components/ErrorBoundary.css'

initTelemetry()

if (import.meta.env.MODE !== 'test') {
  initPerformanceTracking({
    webVitals: true,
    network: true,
    runtime: true,
    reportAllChanges: import.meta.env.MODE === 'development'
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)