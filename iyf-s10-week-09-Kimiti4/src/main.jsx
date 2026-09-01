import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { initTelemetry } from './utils/telemetry'
import './styles/tokens.css'
import './styles/globals.css'
import './styles/AppShell.css'
import './styles/Navigation.css'
import './styles/Feed.css'
import './styles/Features.css'
import './styles/Trust.css'
import './index.css'
import './components/ErrorBoundary.css'

initTelemetry()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)