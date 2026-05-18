import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Upload, MessageSquare, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { indexDocument, queryRAG } from '../utils/api'
import { useAPIKey } from '../context/APIKeyContext'

const RAGDemo = () => {
  const { apiKey } = useAPIKey()
  const [step, setStep] = useState(1) // 1: upload, 2: query
  const [text, setText] = useState('')
  const [sessionId, setSessionId] = useState(null)
  const [chunkCount, setChunkCount] = useState(0)
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [indexing, setIndexing] = useState(false)
  const [error, setError] = useState('')

  const sampleText = `Artificial Intelligence (AI) is transforming the world. Machine learning, a subset of AI, enables systems to learn from data. Deep learning uses neural networks with multiple layers. Natural Language Processing (NLP) helps computers understand human language. Computer vision allows machines to interpret visual information. AI applications include healthcare, finance, transportation, and entertainment. Ethical considerations in AI development are crucial for responsible innovation.`

  const handleIndex = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!text.trim()) {
      setError('Please enter or paste some text')
      return
    }

    if (!apiKey) {
      setError('Please set your OpenAI API key first')
      return
    }

    setIndexing(true)
    try {
      const response = await indexDocument(text)
      setSessionId(response.session_id)
      setChunkCount(response.chunk_count)
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to index document')
    } finally {
      setIndexing(false)
    }
  }

  const handleQuery = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)

    if (!query.trim()) {
      setError('Please enter a question')
      return
    }

    setLoading(true)
    try {
      const response = await queryRAG(query, sessionId)
      setResult(response)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to query document')
    } finally {
      setLoading(false)
    }
  }

  const resetDemo = () => {
    setStep(1)
    setText('')
    setSessionId(null)
    setChunkCount(0)
    setQuery('')
    setResult(null)
    setError('')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 mb-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <FileText className="w-8 h-8 text-primary-600" />
          <div>
            <h2 className="text-3xl font-bold">RAG Demo</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Retrieval-Augmented Generation in action
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
              {step > 1 ? <CheckCircle className="w-6 h-6" /> : <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-bold">1</div>}
              <span className="font-semibold">Index Document</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300 dark:bg-gray-600" />
            <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-bold">2</div>
              <span className="font-semibold">Ask Questions</span>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleIndex}
            >
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">Document Text</label>
                  <button
                    type="button"
                    onClick={() => setText(sampleText)}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    Use sample text
                  </button>
                </div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste your document here... (at least 200 characters recommended)"
                  rows={12}
                  className="input-field resize-none"
                />
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {text.length} characters
                </div>
              </div>

              <button
                type="submit"
                disabled={indexing || !apiKey}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                {indexing && <Loader2 className="w-5 h-5 animate-spin" />}
                <Upload className="w-5 h-5" />
                <span>{indexing ? 'Indexing...' : 'Index Document'}</span>
              </button>

              {error && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}
            </motion.form>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">
                    Document indexed! {chunkCount} chunks created.
                  </span>
                </div>
              </div>

              <form onSubmit={handleQuery}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Ask a Question</label>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="What would you like to know about the document?"
                    className="input-field"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1 flex items-center justify-center space-x-2"
                  >
                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                    <MessageSquare className="w-5 h-5" />
                    <span>{loading ? 'Searching...' : 'Ask Question'}</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={resetDemo}
                    className="btn-secondary"
                  >
                    New Document
                  </button>
                </div>

                {error && (
                  <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                    {error}
                  </div>
                )}
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Query Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Answer */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <MessageSquare className="w-6 h-6 text-primary-600" />
              <span>Answer</span>
            </h3>
            <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
              {result.answer}
            </p>
          </div>

          {/* Retrieved Chunks */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-4">
              Retrieved Context (Top {result.sources.length} chunks)
            </h3>
            <div className="space-y-4">
              {result.sources.map((source, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border-l-4 border-primary-500"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                      Chunk {source.index + 1}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Relevance:
                      </span>
                      <span className="text-sm font-bold text-green-600">
                        {Math.round(source.similarity * 100)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {source.chunk}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Explanation */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-3">How RAG Works</h3>
            <div className="space-y-2 text-gray-600 dark:text-gray-400">
              <p>1. <span className="font-semibold">Chunking:</span> Your document was split into {chunkCount} overlapping chunks</p>
              <p>2. <span className="font-semibold">Embedding:</span> Each chunk was converted to a vector representation</p>
              <p>3. <span className="font-semibold">Retrieval:</span> Your question was embedded and matched against chunks</p>
              <p>4. <span className="font-semibold">Generation:</span> The AI generated an answer using the most relevant chunks</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Info Card */}
      {!result && step === 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <h3 className="text-xl font-semibold mb-3">What is RAG?</h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li>• <span className="font-semibold">Retrieval-Augmented Generation</span> combines document retrieval with AI generation</li>
            <li>• Upload any text document (articles, notes, documentation, etc.)</li>
            <li>• The system chunks, embeds, and indexes your content</li>
            <li>• Ask questions and get accurate answers based on your document</li>
            <li>• See which parts of your document were used to generate the answer</li>
          </ul>
        </motion.div>
      )}
    </div>
  )
}

export default RAGDemo
