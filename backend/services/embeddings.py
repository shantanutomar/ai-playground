import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from typing import List

def get_embedding(client, text: str, model: str = "text-embedding-3-small"):
    """Get embedding for a single text."""
    response = client.embeddings.create(
        input=text,
        model=model
    )
    return response.data[0].embedding

def calculate_similarity(client, words: List[str]):
    """Calculate pairwise similarity between words."""
    if len(words) < 2:
        raise ValueError("At least 2 words are required")
    
    # Get embeddings for all words
    embeddings = []
    for word in words:
        embedding = get_embedding(client, word)
        embeddings.append(embedding)
    
    # Calculate pairwise similarities
    results = []
    for i in range(len(words)):
        for j in range(i + 1, len(words)):
            similarity = cosine_similarity(
                [embeddings[i]], 
                [embeddings[j]]
            )[0][0]
            results.append({
                "word1": words[i],
                "word2": words[j],
                "similarity": float(similarity)
            })
    
    return results

def word_analogy(client, positive: List[str], negative: List[str]):
    """
    Perform word analogy: positive - negative
    Example: king - man + woman = queen
    """
    # Get embeddings
    pos_embeddings = [get_embedding(client, word) for word in positive]
    neg_embeddings = [get_embedding(client, word) for word in negative]
    
    # Calculate resulting vector
    result_vector = np.array(pos_embeddings).mean(axis=0) - np.array(neg_embeddings).mean(axis=0)
    
    # For demo purposes, return the formula used
    return {
        "formula": f"{' + '.join(positive)} - {' - '.join(negative)}",
        "note": "In a full implementation, this would search a vocabulary for the closest match"
    }
