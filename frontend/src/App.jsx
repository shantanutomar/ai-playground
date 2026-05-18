import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Layout from './components/Layout'
import WordSimilarity from './components/WordSimilarity'
import TokenVisualizer from './components/TokenVisualizer'
import RAGDemo from './components/RAGDemo'
import ChatPlayground from './components/ChatPlayground'
import SemanticSearch from './components/SemanticSearch'

const tabs = [
  { id: 'similarity', name: 'Word Similarity', component: WordSimilarity },
  { id: 'tokens', name: 'Token Visualizer', component: TokenVisualizer },
  { id: 'rag', name: 'RAG Demo', component: RAGDemo },
  { id: 'chat', name: 'Chat Playground', component: ChatPlayground },
  { id: 'search', name: 'Semantic Search', component: SemanticSearch },
]

function App() {
  const [activeTab, setActiveTab] = useState('similarity')
  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component

  return (
    <Layout 
      tabs={tabs} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          {ActiveComponent && <ActiveComponent />}
        </motion.div>
      </AnimatePresence>
    </Layout>
  )
}

export default App
