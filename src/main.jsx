import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App'
import ReceptionDashboard from './app/protected/recepcionist/page'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {window.location.pathname === '/recepcionista' ? <ReceptionDashboard /> : <App />}
  </StrictMode>,
)
