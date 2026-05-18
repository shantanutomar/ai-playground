import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Plus, Trash2, Loader2 } from 'lucide-react'
import { calculateSimilarity } from '../utils/api'
import { useAPIKey } from '../context/APIKeyContext'

const getSimilarityEmoji = (score) => {
  if (score >= 0.9) return '🔥🔥🔥'
  if (score >= 0.75) return '😊😊'
  if (score >= 0.5) return '😐'
  if (score >= 0.25) return '🤷'
  return '🌍🌙'
}

const getSimilarityLabel = (score) => {
  if (score >= 0.9) return 'Identical Twins'
  if (score >= 0.75) return 'Close Friends'
  if (score >= 0.5) return 'Acquaintances'
  if (score >= 0.25) return 'Strangers'
  return 'From Different Planets'
}

const getSimilarityColor = (score) => {
  if (score >= 0.75) return 'from-green-500 to-emerald-500'
  if (score >= 0.5) return 'from-yellow-500 to-amber-500'
  if (score >= 0.25) return 'from-orange-500 to-red-500'
  return 'from-red-500 to-pink-500'
}

const WordSimilarity = () => {
  const { apiKey } = useAPIKey()
  const [words, setWords] = useState(['', ''])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showTechnical, setShowTechnical] = useState(false)

  const addWord = () => {
    setWords([...words, ''])
  }

  const removeWord = (index) => {
    if (words.length > 2) {
      setWords(words.filter((_, i) => i !== index))
    }
  }

  const updateWord = (index, value) => {
    const newWords = [...words]
    newWords[index] = value
    setWords(newWords)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResults([])
    
    const validWords = words.filter(w => w.trim())
    if (validWords.length < 2) {
      setError('Please enter at least 2 words')
      return
    }

    if (!apiKey) {
      setError('Please set your OpenAI API key first')
      return
    }

    setLoading(true)
    try {
      const response = await calculateSimilarity(validWords)
      setResults(response.results)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to calculate similarity')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 mb-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Sparkles className="w-8 h-8 text-primary-600" />
          <div>
            <h2 className="text-3xl font-bold">Word Similarity Explorer</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Compare words using AI embeddings and cosine similarity
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-3 mb-6">
            {words.map((word, index) => (
              <div key={index} className="flex space-x-3">
                <input
                  type="text"
                  value={word}
                  onChange={(e) => updateWord(index, e.target.value)}
                  placeholder={`Word ${index + 1}`}
                  className="input-field flex-1"
                />
                {words.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeWord(index)}
                    className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={addWord}
              className="btn-secondary flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Word</span>
            </button>
            
            <button
              type="submit"
              disabled={loading || !apiKey}
              className="btn-primary flex items-center space-x-2 flex-1"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              <span>{loading ? 'Calculating...' : 'Compare Words'}</span>
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </form>
      </motion.div>

      {/* Results */}
      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {results.map((result, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <span className="text-2xl font-bold text-primary-600">
                    {result.word1}
                  </span>
                  <span className="text-gray-400">↔</span>
                  <span className="text-2xl font-bold text-accent-600">
                    {result.word2}
                  </span>
                </div>
                <div className="text-4xl">
                  {getSimilarityEmoji(result.similarity)}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-semibold">
                    {getSimilarityLabel(result.similarity)}
                  </span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {Math.round(result.similarity * 100)}%
                  </span>
                </div>
                
                <div className="relative h-4 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${result.similarity * 100}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full bg-gradient-to-r ${getSimilarityColor(result.similarity)} rounded-full`}
                  />
                </div>
              </div>

              <button
                onClick={() => setShowTechnical(!showTechnical)}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                {showTechnical ? 'Hide' : 'Show'} Technical Details
              </button>

              {showTechnical && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg"
                >
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">Cosine Similarity:</span> {result.similarity.toFixed(6)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    This score represents how similar the semantic meanings are, calculated using OpenAI embeddings and cosine similarity.
                  </p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Info Card */}
      {results.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <h3 className="text-xl font-semibold mb-3">How it works</h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li>• Enter 2 or more words to compare</li>
            <li>• AI generates embeddings (vector representations) for each word</li>
            <li>• Cosine similarity measures how close the vectors are</li>
            <li>• Higher scores = more similar meanings</li>
            <li>• Results shown in a fun, easy-to-understand format!</li>
          </ul>
        </motion.div>
      )}
    </div>
  )
}

export default WordSimilarity
