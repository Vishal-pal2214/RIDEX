import React, { createContext, useEffect } from 'react'
import { io } from 'socket.io-client'
import { SOCKET_URL } from '../config/api'

export const SocketContext = createContext()

const socket = io(SOCKET_URL, {
  autoConnect: true,
  withCredentials: true,
})

const SocketProvider = ({ children }) => {
  useEffect(() => {
    const handleConnect = () => {
      console.log('Connected to server')
    }

    const handleDisconnect = () => {
      console.log('Disconnected from server')
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
    }
  }, [])

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  )
}

export default SocketProvider
