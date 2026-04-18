import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import SocketProvider from './context/SocketContext'
import UserContext from './context/UserContext'
import CaptainContext from './context/CapatainContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SocketProvider>
        <UserContext>
          <CaptainContext>
            <App />
          </CaptainContext>
        </UserContext>
      </SocketProvider>
    </BrowserRouter>
  </StrictMode>,
)
