import { createContext, useContext, useState, useEffect } from 'react'
import { setApiKey as setApiKeyHeader } from '../utils/api'

const APIKeyContext = createContext()

export const useAPIKey = () => {
  const context = useContext(APIKeyContext)
  if (!context) {
    throw new Error('useAPIKey must be used within APIKeyProvider')
  }
  return context
}

export const APIKeyProvider = ({ children }) => {
  const [apiKey, setApiKeyState] = useState(() => {
    return localStorage.getItem('openai_api_key') || ''
  })

  const setApiKey = (key) => {
    setApiKeyState(key)
    if (key) {
      localStorage.setItem('openai_api_key', key)
      setApiKeyHeader(key)
    } else {
      localStorage.removeItem('openai_api_key')
      setApiKeyHeader(null)
    }
  }

  useEffect(() => {
    if (apiKey) {
      setApiKeyHeader(apiKey)
    }
  }, [apiKey])

  return (
    <APIKeyContext.Provider value={{ apiKey, setApiKey }}>
      {children}
    </APIKeyContext.Provider>
  )
}
