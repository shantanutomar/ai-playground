import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from typing import List
from services.embeddings import get_embedding

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    """Split text into overlapping chunks."""
    chunks = []
    start = 0
    text_length = len(text)
    
    while start < text_length:
        end = start + chunk_size
        chunk = text[start:end]
        
        if chunk.strip():
            chunks.append(chunk)
        
        start = end - overlap
        
        if end >= text_length:
            break
    
    return chunks

def create_embeddings(client, chunks: List[str]) -> List[List[float]]:
    """Create embeddings for all chunks."""
    print(f"Creating embeddings for {len(chunks)} chunks")
    embeddings = []
    for chunk in chunks:
        embedding = get_embedding(client, chunk)
        embeddings.append(embedding)
    print(f"Created {len(embeddings)} embeddings")
    return embeddings

def retrieve_chunks(client, query: str, chunks: List[str], embeddings: List[List[float]], top_k: int = 3):
    """Retrieve most relevant chunks for a query."""
    query_embedding = get_embedding(client, query)
    
    # Calculate similarities
    similarities = cosine_similarity([query_embedding], embeddings)[0]
    
    # Get top k indices
    top_indices = np.argsort(similarities)[-top_k:][::-1]
    
    # Return chunks with scores
    results = []
    for idx in top_indices:
        results.append({
            "chunk": chunks[idx],
            "similarity": float(similarities[idx]),
            "index": int(idx)
        })
    
    return results

def generate_answer(client, query: str, relevant_chunks: List[dict]) -> str:
    """Generate answer using retrieved chunks."""
    context = "\n\n".join([chunk["chunk"] for chunk in relevant_chunks])
    
    messages = [
        {
            "role": "system",
            "content": "You are a helpful assistant. Answer the question based on the provided context. If the context doesn't contain enough information, say so."
        },
        {
            "role": "user",
            "content": f"Context:\n{context}\n\nQuestion: {query}"
        }
    ]
    
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages,
        temperature=0.7,
        max_tokens=500
    )
    
    return response.choices[0].message.content
