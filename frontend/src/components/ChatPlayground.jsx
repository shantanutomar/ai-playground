import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, Trash2, Settings, User, Bot, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { chatCompletion } from '../utils/api'
import { useAPIKey } from '../context/APIKeyContext'

const ChatPlayground = () => {
  const { apiKey } = useAPIKey()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [showRequest, setShowRequest] = useState(false)
  const [lastRequest, setLastRequest] = useState(null)
  const [lastResponse, setLastResponse] = useState(null)
  
  // Settings
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful AI assistant.')
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(500)
  
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    
    if (!input.trim()) return
    
    if (!apiKey) {
      setError('Please set your OpenAI API key first')
      return
    }

    const userMessage = { role: 'user', content: input }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setError('')
    setLoading(true)

    try {
      const response = await chatCompletion(
        newMessages,
        temperature,
        maxTokens,
        systemPrompt
      )
      
      setLastRequest({
        messages: newMessages,
        temperature,
        max_tokens: maxTokens,
        system_prompt: systemPrompt
      })
      setLastResponse(response)
      
      const assistantMessage = { role: 'assistant', content: response.response.message }
      setMessages([...newMessages, assistantMessage])
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to get response')
    } finally {
      setLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([])
    setError('')
    setLastRequest(null)
    setLastResponse(null)
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 h-[600px] flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-8 h-8 text-primary-600" />
                <div>
                  <h2 className="text-2xl font-bold">Chat Playground</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {messages.length} messages
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 rounded-lg bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                  title="Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <button
                  onClick={clearChat}
                  className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  title="Clear Chat"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Start a conversation!</p>
                  </div>
                </div>
              ) : (
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`flex items-start space-x-2 max-w-[80%] ${
                          message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                        }`}
                      >
                        <div
                          className={`p-2 rounded-full ${
                            message.role === 'user'
                              ? 'bg-primary-100 dark:bg-primary-900/30'
                              : 'bg-accent-100 dark:bg-accent-900/30'
                          }`}
                        >
                          {message.role === 'user' ? (
                            <User className="w-5 h-5 text-primary-600" />
                          ) : (
                            <Bot className="w-5 h-5 text-accent-600" />
                          )}
                        </div>
                        <div
                          className={`p-4 rounded-2xl ${
                            message.role === 'user'
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-gray-100'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
              
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex items-center space-x-2 p-4 bg-gray-100 dark:bg-slate-700 rounded-2xl">
                    <Bot className="w-5 h-5 text-accent-600" />
                    <Loader2 className="w-5 h-5 animate-spin text-accent-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Thinking...</span>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSend} className="flex space-x-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={loading}
                className="input-field flex-1"
              />
              <button
                type="submit"
                disabled={loading || !apiKey || !input.trim()}
                className="btn-primary px-6"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        </div>

        {/* Settings Panel */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
              <Settings className="w-6 h-6 text-primary-600" />
              <span>Parameters</span>
            </h3>

            <div className="space-y-6">
              {/* System Prompt */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  System Prompt
                </label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={3}
                  className="input-field resize-none text-sm"
                />
              </div>

              {/* Temperature */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Temperature: {temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                  <span>Focused</span>
                  <span>Balanced</span>
                  <span>Creative</span>
                </div>
              </div>

              {/* Max Tokens */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Max Tokens: {maxTokens}
                </label>
                <input
                  type="range"
                  min="50"
                  max="2000"
                  step="50"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Limits response length
                </p>
              </div>

              {/* Last Response Stats */}
              {lastResponse && (
                <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                  <h4 className="text-sm font-semibold mb-2">Last Response</h4>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <p>Prompt: {lastResponse.response.usage.prompt_tokens} tokens</p>
                    <p>Response: {lastResponse.response.usage.completion_tokens} tokens</p>
                    <p>Total: {lastResponse.response.usage.total_tokens} tokens</p>
                  </div>
                </div>
              )}

              {/* Request/Response Toggle */}
              {lastRequest && (
                <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                  <button
                    onClick={() => setShowRequest(!showRequest)}
                    className="w-full flex items-center justify-between text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    <span>View Request/Response</span>
                    {showRequest ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  
                  {showRequest && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="mt-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg overflow-auto max-h-64"
                    >
                      <pre className="text-xs">
                        {JSON.stringify(lastRequest, null, 2)}
                      </pre>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-4 mt-6"
          >
            <h4 className="text-sm font-semibold mb-2">Tips</h4>
            <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
              <li>• Adjust temperature for creativity</li>
              <li>• System prompts set behavior</li>
              <li>• Max tokens limit response length</li>
              <li>• Chat history is maintained</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ChatPlayground
