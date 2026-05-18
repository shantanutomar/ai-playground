import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add API key to requests
export const setApiKey = (apiKey) => {
  if (apiKey) {
    api.defaults.headers.common['X-OpenAI-Key'] = apiKey
  } else {
    delete api.defaults.headers.common['X-OpenAI-Key']
  }
}

export const healthCheck = async () => {
  const response = await api.get('/api/health')
  return response.data
}

export const calculateSimilarity = async (words) => {
  const response = await api.post('/api/embeddings/similarity', { words })
  return response.data
}

export const calculateAnalogy = async (positive, negative) => {
  const response = await api.post('/api/embeddings/analogy', { positive, negative })
  return response.data
}

export const countTokens = async (text, model = 'gpt-4') => {
  const response = await api.post('/api/tokens/count', { text, model })
  return response.data
}

export const indexDocument = async (text) => {
  const response = await api.post('/api/rag/index', { text })
  return response.data
}

export const queryRAG = async (query, sessionId) => {
  const response = await api.post('/api/rag/query', { 
    query, 
    session_id: sessionId 
  })
  return response.data
}

export const chatCompletion = async (messages, temperature, maxTokens, systemPrompt) => {
  const response = await api.post('/api/chat/completion', {
    messages,
    temperature,
    max_tokens: maxTokens,
    system_prompt: systemPrompt
  })
  return response.data
}

export const semanticSearch = async (query) => {
  const response = await api.post('/api/search/semantic', { query })
  return response.data
}

export default api
