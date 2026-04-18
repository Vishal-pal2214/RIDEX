const normalizeUrl = (value) => value.replace(/\/$/, '')

const defaultSocketUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
  ? window.location.origin
  : 'http://localhost:3000'

export const API_BASE_URL = normalizeUrl(import.meta.env.VITE_API_URL || '/api')
export const SOCKET_URL = normalizeUrl(import.meta.env.VITE_SOCKET_URL || defaultSocketUrl)
