import { useState } from 'react'
import { motion } from 'framer-motion'
import { Type, Copy, Check, Loader2 } from 'lucide-react'
import { countTokens } from '../utils/api'

const TokenVisualizer = () => {
  const [text, setText] = useState('')
  const [model, setModel] = useState('gpt-4')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const models = [
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)

    if (!text.trim()) {
      setError('Please enter some text')
      return
    }

    setLoading(true)
    try {
      const response = await countTokens(text, model)
      setResult(response)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to count tokens')
    } finally {
      setLoading(false)
    }
  }

  const copyTokens = () => {
    if (result?.tokens) {
      navigator.clipboard.writeText(result.tokens.join(''))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getTokenColor = (index) => {
    const colors = [
      'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
      'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300',
      'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
      'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 mb-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Type className="w-8 h-8 text-primary-600" />
          <div>
            <h2 className="text-3xl font-bold">Token Visualizer</h2>
            <p className="text-gray-600 dark:text-gray-400">
              See how AI models tokenize your text
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="input-field"
            >
              {models.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Text</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text to tokenize..."
              rows={6}
              className="input-field resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            <span>{loading ? 'Analyzing...' : 'Tokenize Text'}</span>
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </form>
      </motion.div>

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-6">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Token Count
              </div>
              <div className="text-4xl font-bold text-primary-600">
                {result.count}
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Estimated Cost
              </div>
              <div className="text-4xl font-bold text-green-600">
                ${result.cost}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Input tokens only
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Characters
              </div>
              <div className="text-4xl font-bold text-accent-600">
                {text.length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                ~{(result.count / text.length).toFixed(2)} tokens/char
              </div>
            </div>
          </div>

          {/* Tokens Display */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Token Breakdown</h3>
              <button
                onClick={copyTokens}
                className="flex items-center space-x-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-wrap gap-1 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg max-h-96 overflow-y-auto">
              {result.tokens.map((token, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.01 }}
                  className={`px-2 py-1 rounded text-sm font-mono ${getTokenColor(index)}`}
                  title={`Token ${index + 1}`}
                >
                  {token.replace(/\n/g, '\\n').replace(/ /g, '·')}
                </motion.span>
              ))}
            </div>

            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              <p>• Each colored box represents one token</p>
              <p>• Spaces shown as · (middle dot)</p>
              <p>• Newlines shown as \n</p>
              <p>• Different models may tokenize text differently</p>
            </div>
          </div>

          {/* Info */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-3">Understanding Tokens</h3>
            <div className="space-y-2 text-gray-600 dark:text-gray-400">
              <p>
                Tokens are pieces of words used by AI models. Common words often map to single tokens,
                while uncommon words may be broken into multiple tokens.
              </p>
              <p>
                Token limits determine how much text you can process in a single request.
                Both input and output tokens count toward this limit and affect cost.
              </p>
              <p className="font-semibold text-primary-600 dark:text-primary-400">
                Model: {model} | Avg {(text.length / result.count).toFixed(2)} characters per token
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!result && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <h3 className="text-xl font-semibold mb-3">Try it out!</h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li>• Enter any text to see how it's tokenized</li>
            <li>• Different models use different tokenization strategies</li>
            <li>• Understand token counts to estimate API costs</li>
            <li>• Visualize which parts of your text form single tokens</li>
          </ul>
        </motion.div>
      )}
    </div>
  )
}

export default TokenVisualizer
