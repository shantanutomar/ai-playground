# AI Concept Playground

A full-featured web application showcasing core AI concepts including embeddings, chat completion, tokenization, and Retrieval-Augmented Generation (RAG). Built with React, Tailwind CSS, and FastAPI.

## Features

### 1. Word Similarity Explorer
Compare words using OpenAI embeddings and cosine similarity. See results in a fun, intuitive format with emojis, relationship labels, and animated progress bars.

- **Input**: 2 or more words
- **Output**: Similarity scores with fun visualizations
- **Tech**: OpenAI embeddings (text-embedding-3-small), cosine similarity

### 2. Token Visualizer
Understand how AI models tokenize text. See individual tokens color-coded, count estimates, and cost calculations.

- **Input**: Any text
- **Output**: Token breakdown, count, and cost estimate
- **Tech**: tiktoken library, support for GPT-4, GPT-3.5-turbo, GPT-4-turbo

### 3. Mini RAG Demo
Retrieval-Augmented Generation in action. Upload a document, ask questions, and get AI-generated answers with source citations.

- **Input**: Text document + questions
- **Output**: AI answers with relevant chunks shown
- **Tech**: Document chunking, embedding-based retrieval, GPT-3.5 for generation

### 4. Chat Completion Playground
Interactive chatbot with adjustable parameters. Experiment with temperature, max tokens, and system prompts.

- **Input**: Chat messages + parameters
- **Output**: AI responses with usage stats
- **Tech**: OpenAI chat completion API, customizable parameters

### 5. Semantic Search
Search a dataset of movie quotes by meaning, not just keywords. Demonstrates semantic similarity in action.

- **Input**: Natural language query
- **Output**: Ranked results by semantic similarity
- **Tech**: Pre-computed embeddings, cosine similarity ranking

## Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with custom theme
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Fonts**: Inter (Google Fonts)

### Backend
- **Framework**: FastAPI (Python)
- **AI SDK**: OpenAI Python SDK
- **ML Libraries**: NumPy, scikit-learn
- **Tokenization**: tiktoken
- **Server**: Uvicorn

## Local Development Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- OpenAI API key

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --port 8000
```

The backend API will be available at `http://localhost:8000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Setting Up Your OpenAI API Key

1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Open the app in your browser
3. Click the key icon in the header
4. Enter your API key
5. The key is stored locally in your browser (not on any server)

## Project Structure

```
ai-playground/
├── frontend/
│   ├── src/
│   │   ├── components/         # React components for each feature
│   │   │   ├── Layout.jsx
│   │   │   ├── WordSimilarity.jsx
│   │   │   ├── TokenVisualizer.jsx
│   │   │   ├── RAGDemo.jsx
│   │   │   ├── ChatPlayground.jsx
│   │   │   └── SemanticSearch.jsx
│   │   ├── context/            # React Context providers
│   │   │   ├── APIKeyContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── utils/              # API client and utilities
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── vercel.json
├── backend/
│   ├── services/               # Business logic modules
│   │   ├── embeddings.py
│   │   ├── tokens.py
│   │   ├── rag.py
│   │   ├── chat.py
│   │   └── search.py
│   ├── main.py                 # FastAPI application
│   ├── requirements.txt
│   └── render.yaml
├── .gitignore
└── README.md
```

## API Endpoints

### Health Check
- `GET /api/health` - Check API status

### Embeddings
- `POST /api/embeddings/similarity` - Calculate word similarity
- `POST /api/embeddings/analogy` - Word analogy operations

### Tokens
- `POST /api/tokens/count` - Count tokens and estimate cost

### RAG
- `POST /api/rag/index` - Index a document
- `POST /api/rag/query` - Query indexed document

### Chat
- `POST /api/chat/completion` - Get chat completion

### Search
- `POST /api/search/semantic` - Semantic search on movie quotes

All endpoints (except `/api/health`) require the `X-OpenAI-Key` header with your OpenAI API key.

## Deployment

### Deploy Frontend to Vercel

1. Push your code to GitHub
2. Import the project on [Vercel](https://vercel.com)
3. Set root directory to `frontend`
4. Add environment variable:
   - `VITE_API_URL`: Your backend URL (e.g., `https://your-app.onrender.com`)
5. Deploy!

### Deploy Backend to Render

1. Push your code to GitHub
2. Create a new Web Service on [Render](https://render.com)
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Deploy!

### Update CORS Settings

After deployment, update the CORS settings in `backend/main.py` to include your production frontend URL:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://your-vercel-app.vercel.app"  # Add your Vercel URL
    ],
    # ...
)
```

## Design & UX

### Color Scheme
- **Primary**: Purple (#8B5CF6) and Blue (#3B82F6)
- **Accent**: Pink (#EC4899) and Cyan (#06B6D4)
- **Success**: Green (#10B981)
- **Warning**: Amber (#F59E0B)

### Features
- **Dark Mode**: Fully supported with smooth transitions
- **Glassmorphism**: Modern card designs with backdrop blur
- **Animations**: Smooth entrance and interaction animations
- **Responsive**: Mobile-first design that works on all devices
- **Accessibility**: ARIA labels, keyboard navigation, focus indicators

## Security Considerations

- **API Keys**: Never stored on the backend, only in browser localStorage
- **CORS**: Configured to only allow requests from trusted origins
- **Input Validation**: All API endpoints validate inputs
- **Client-Side Only**: All OpenAI API calls originate from the backend with the user's key

## Cost Estimation

Approximate costs per request (varies by model and usage):

- **Word Similarity**: ~$0.0001 per comparison (embeddings)
- **Token Visualizer**: Free (local tokenization)
- **RAG**: ~$0.0005-0.002 per document + query
- **Chat**: ~$0.001-0.01 per exchange (depending on length)
- **Semantic Search**: ~$0.0001 per search (embeddings)

## Future Enhancements

- [ ] Vector database integration (Pinecone/Weaviate)
- [ ] Streaming chat responses
- [ ] Export conversation history
- [ ] 2D visualization of embeddings
- [ ] Per-session cost tracking
- [ ] More embedding models
- [ ] Batch processing for large documents
- [ ] Custom dataset upload for semantic search

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for learning and demonstrations.

## Acknowledgments

- OpenAI for the powerful APIs
- The React and FastAPI communities
- Tailwind CSS for the utility-first CSS framework
- Framer Motion for smooth animations

## Support

If you find this project helpful, please star it on GitHub!

---

Built with ❤️ to demonstrate AI concepts in an interactive and fun way.
