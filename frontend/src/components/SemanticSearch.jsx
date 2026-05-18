import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Film, Loader2, TrendingUp } from 'lucide-react'
import { semanticSearch } from '../utils/api'
import { useAPIKey } from '../context/APIKeyContext'

const SemanticSearch = () => {
  const { apiKey } = useAPIKey()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const exampleQueries = [
    'adventure in space',
    'dealing with the truth',
    'never giving up',
    'home sweet home',
    'a powerful villain',
  ]

  const handleSearch = async (searchQuery = query) => {
    setError('')
    
    if (!searchQuery.trim()) {
      setError('Please enter a search query')
      return
    }

    if (!apiKey) {
      setError('Please set your OpenAI API key first')
      return
    }

    setLoading(true)
    setQuery(searchQuery)
    
    try {
      const response = await semanticSearch(searchQuery)
      setResults(response.results)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to search')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleSearch()
  }

  const getSimilarityColor = (score) => {
    if (score >= 0.8) return 'text-green-600 dark:text-green-400'
    if (score >= 0.6) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-orange-600 dark:text-orange-400'
  }

  const getSimilarityBg = (score) => {
    if (score >= 0.8) return 'bg-green-100 dark:bg-green-900/30'
    if (score >= 0.6) return 'bg-yellow-100 dark:bg-yellow-900/30'
    return 'bg-orange-100 dark:bg-orange-900/30'
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 mb-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Search className="w-8 h-8 text-primary-600" />
          <div>
            <h2 className="text-3xl font-bold">Semantic Search</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Search movie quotes by meaning, not just keywords
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Search Query
            </label>
            <div className="flex space-x-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Describe what you're looking for..."
                className="input-field flex-1"
              />
              <button
                type="submit"
                disabled={loading || !apiKey}
                className="btn-primary px-8 flex items-center space-x-2"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                <Search className="w-5 h-5" />
                <span>{loading ? 'Searching...' : 'Search'}</span>
              </button>
            </div>
          </div>

          {/* Example Queries */}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Try these examples:
            </p>
            <div className="flex flex-wrap gap-2">
              {exampleQueries.map((example, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSearch(example)}
                  disabled={loading}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </form>
      </motion.div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="glass-card p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Found <span className="font-bold text-primary-600">{results.length}</span> results for "{query}"
              </p>
            </div>

            {results.map((result, index) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 hover:shadow-2xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                      <Film className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                          #{index + 1}
                        </span>
                        <TrendingUp className={`w-4 h-4 ${getSimilarityColor(result.similarity)}`} />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {result.source}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full ${getSimilarityBg(result.similarity)}`}>
                    <span className={`text-sm font-bold ${getSimilarityColor(result.similarity)}`}>
                      {Math.round(result.similarity * 100)}%
                    </span>
                  </div>
                </div>

                <blockquote className="text-lg font-medium text-gray-800 dark:text-gray-200 italic border-l-4 border-primary-500 pl-4 py-2">
                  "{result.text}"
                </blockquote>

                {/* Similarity Bar */}
                <div className="mt-4">
                  <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.similarity * 100}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className={`h-full ${
                        result.similarity >= 0.8
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                          : result.similarity >= 0.6
                          ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
                          : 'bg-gradient-to-r from-orange-500 to-red-500'
                      }`}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Card */}
      {results.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <h3 className="text-xl font-semibold mb-4">How Semantic Search Works</h3>
          
          <div className="space-y-4 text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Beyond Keywords
              </h4>
              <p>
                Traditional search looks for exact keyword matches. Semantic search understands
                the <em>meaning</em> behind your query and finds results that are conceptually similar.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                The Dataset
              </h4>
              <p>
                We've pre-loaded 20 famous movie quotes. Try searching for concepts like
                "adventure", "home", "truth", or "never give up" - you'll find quotes that
                match the meaning, even if they don't contain those exact words.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                How It Works
              </h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Your query is converted to an embedding (vector)</li>
                <li>Each movie quote has a pre-computed embedding</li>
                <li>Cosine similarity finds the closest matches</li>
                <li>Results are ranked by relevance score</li>
              </ol>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
              <p className="text-sm">
                💡 <strong>Try it:</strong> Search for abstract concepts and see how well
                it finds relevant quotes!
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 flex flex-col items-center justify-center"
        >
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Searching through movie quotes...
          </p>
        </motion.div>
      )}
    </div>
  )
}

export default SemanticSearch
