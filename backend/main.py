from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import openai

from services.embeddings import calculate_similarity, word_analogy
from services.tokens import count_tokens, tokenize_text
from services.rag import chunk_text, create_embeddings, retrieve_chunks, generate_answer
from services.chat import chat_completion
from services.search import semantic_search, SAMPLE_DATASET

app = FastAPI(title="AI Concept Playground API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Add production URL later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models
class SimilarityRequest(BaseModel):
    words: List[str]

class AnalogyRequest(BaseModel):
    positive: List[str]
    negative: List[str]

class TokenRequest(BaseModel):
    text: str
    model: str = "gpt-4"

class RAGIndexRequest(BaseModel):
    text: str

class RAGQueryRequest(BaseModel):
    query: str
    session_id: str

class ChatRequest(BaseModel):
    messages: List[dict]
    temperature: float = 0.7
    max_tokens: int = 500
    system_prompt: Optional[str] = None

class SearchRequest(BaseModel):
    query: str

# In-memory storage for RAG sessions
rag_sessions = {}

# Helper to validate API key
def get_openai_client(api_key: Optional[str]):
    if not api_key:
        raise HTTPException(status_code=401, detail="OpenAI API key is required. Please provide it in the X-OpenAI-Key header.")
    return openai.OpenAI(api_key=api_key)

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "AI Concept Playground API is running"}

@app.post("/api/embeddings/similarity")
async def embeddings_similarity(
    request: SimilarityRequest,
    x_openai_key: Optional[str] = Header(None)
):
    try:
        client = get_openai_client(x_openai_key)
        results = calculate_similarity(client, request.words)
        return {"success": True, "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/embeddings/analogy")
async def embeddings_analogy(
    request: AnalogyRequest,
    x_openai_key: Optional[str] = Header(None)
):
    try:
        client = get_openai_client(x_openai_key)
        result = word_analogy(client, request.positive, request.negative)
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/tokens/count")
async def tokens_count(request: TokenRequest):
    try:
        token_data = count_tokens(request.text, request.model)
        tokens_list = tokenize_text(request.text, request.model)
        return {
            "success": True,
            "count": token_data["count"],
            "cost": token_data["cost"],
            "tokens": tokens_list
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/rag/index")
async def rag_index(
    request: RAGIndexRequest,
    x_openai_key: Optional[str] = Header(None)
):
    try:
        client = get_openai_client(x_openai_key)
        chunks = chunk_text(request.text)
        embeddings = create_embeddings(client, chunks)
        
        # Create session ID
        import uuid
        session_id = str(uuid.uuid4())
        rag_sessions[session_id] = {
            "chunks": chunks,
            "embeddings": embeddings
        }
        
        return {
            "success": True,
            "session_id": session_id,
            "chunk_count": len(chunks)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/rag/query")
async def rag_query(
    request: RAGQueryRequest,
    x_openai_key: Optional[str] = Header(None)
):
    try:
        if request.session_id not in rag_sessions:
            raise HTTPException(status_code=404, detail="Session not found. Please index a document first.")
        
        client = get_openai_client(x_openai_key)
        session_data = rag_sessions[request.session_id]
        
        relevant_chunks = retrieve_chunks(
            client,
            request.query,
            session_data["chunks"],
            session_data["embeddings"]
        )
        
        answer = generate_answer(client, request.query, relevant_chunks)
        
        return {
            "success": True,
            "answer": answer,
            "sources": relevant_chunks
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat/completion")
async def chat_completion_endpoint(
    request: ChatRequest,
    x_openai_key: Optional[str] = Header(None)
):
    try:
        client = get_openai_client(x_openai_key)
        response = chat_completion(
            client,
            request.messages,
            request.temperature,
            request.max_tokens,
            request.system_prompt
        )
        return {"success": True, "response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/search/semantic")
async def search_semantic(
    request: SearchRequest,
    x_openai_key: Optional[str] = Header(None)
):
    try:
        client = get_openai_client(x_openai_key)
        results = semantic_search(client, request.query, SAMPLE_DATASET)
        return {"success": True, "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
