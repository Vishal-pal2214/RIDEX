const normalizeUrl = (value) => value.replace(/\/$/, '')

// Determine the backend URL
const getBackendUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:3000'
  
  // In development (localhost), connect directly to backend
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3000'
  }
  
  // In production, use the same origin
  return window.location.origin
}

const backendUrl = getBackendUrl()

export const API_BASE_URL = normalizeUrl(import.meta.env.VITE_API_URL || '/api')
export const SOCKET_URL = normalizeUrl(import.meta.env.VITE_SOCKET_URL || backendUrl)
