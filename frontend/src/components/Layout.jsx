import { useState } from 'react'
import { motion } from 'framer-motion'
import { Moon, Sun, Key, Menu, X, Sparkles } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAPIKey } from '../context/APIKeyContext'

const Layout = ({ children, tabs, activeTab, setActiveTab }) => {
  const { isDark, toggleTheme } = useTheme()
  const { apiKey, setApiKey } = useAPIKey()
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleApiKeySubmit = (e) => {
    e.preventDefault()
    setApiKey(apiKeyInput)
    setShowApiKeyModal(false)
    setApiKeyInput('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="glass-card m-4 p-4 sticky top-4 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-8 h-8 text-primary-600" />
            </motion.div>
            <h1 className="text-2xl md:text-3xl font-bold gradient-text">
              AI Concept Playground
            </h1>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            <button
              onClick={() => {
                setApiKeyInput(apiKey)
                setShowApiKeyModal(true)
              }}
              className={`p-2 rounded-lg transition-colors ${
                apiKey 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                  : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              }`}
              title={apiKey ? 'API Key Set' : 'Set API Key'}
            >
              <Key className="w-5 h-5" />
            </button>
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-200 dark:bg-slate-700"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className={`mt-6 ${mobileMenuOpen ? 'block' : 'hidden md:block'}`}>
          <div className="flex flex-col md:flex-row md:space-x-2 space-y-2 md:space-y-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setMobileMenuOpen(false)
                }}
                className={`tab-button ${
                  activeTab === tab.id ? 'tab-active' : 'tab-inactive'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 pb-8">
        {children}
      </main>

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card p-6 max-w-md w-full"
          >
            <h2 className="text-2xl font-bold mb-4">OpenAI API Key</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Enter your OpenAI API key to use the playground features. Your key is stored locally in your browser.
            </p>
            <form onSubmit={handleApiKeySubmit}>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="sk-..."
                className="input-field mb-4"
              />
              <div className="flex space-x-3">
                <button type="submit" className="btn-primary flex-1">
                  Save Key
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowApiKeyModal(false)
                    setApiKeyInput('')
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
              {apiKey && (
                <button
                  type="button"
                  onClick={() => {
                    setApiKey('')
                    setShowApiKeyModal(false)
                    setApiKeyInput('')
                  }}
                  className="mt-3 w-full text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  Clear API Key
                </button>
              )}
            </form>
          </motion.div>
        </div>
      )}

      {/* API Key Warning Banner */}
      {!apiKey && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md glass-card p-4 border-l-4 border-amber-500 z-40">
          <div className="flex items-start space-x-3">
            <Key className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">API Key Required</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Set your OpenAI API key to start using the features.
              </p>
              <button
                onClick={() => setShowApiKeyModal(true)}
                className="mt-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                Set API Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Layout
