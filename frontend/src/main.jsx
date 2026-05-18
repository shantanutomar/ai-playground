import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { APIKeyProvider } from './context/APIKeyContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <APIKeyProvider>
        <App />
      </APIKeyProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
