import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App, { GlobalErrorBoundary } from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </StrictMode>,
)
