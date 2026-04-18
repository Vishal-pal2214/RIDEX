import React, { createContext, useEffect } from 'react'
import { io } from 'socket.io-client'
import { SOCKET_URL } from '../config/api'

export const SocketContext = createContext()

const socket = io(SOCKET_URL, {
  autoConnect: true,
  withCredentials: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity,
  transports: ['websocket', 'polling']
})

const SocketProvider = ({ children }) => {
  useEffect(() => {
    const handleConnect = () => {
      console.log('✅ Connected to server with socket ID:', socket.id)
    }

    const handleDisconnect = () => {
      console.log('❌ Disconnected from server')
    }

    const handleConnectError = (error) => {
      console.error('❌ Socket connection error:', error)
    }

    const handleError = (error) => {
      console.error('❌ Socket error:', error)
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('connect_error', handleConnectError)
    socket.on('error', handleError)

    // Log connection attempt
    console.log('🔄 Attempting to connect to socket server at:', SOCKET_URL)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('connect_error', handleConnectError)
      socket.off('error', handleError)
    }
  }, [])

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  )
}

export default SocketProvider
