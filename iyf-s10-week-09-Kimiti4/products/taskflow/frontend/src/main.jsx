import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { OrgProvider } from './context/OrgContext';
import { ToastProvider } from './components/ToastProvider';
import './styles/tokens.css';
import './styles/globals.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/pages.css';
import './styles/board.css';
import './styles/dark.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <OrgProvider>
            <App />
          </OrgProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
