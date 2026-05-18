import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from typing import List
from services.embeddings import get_embedding

# Sample dataset: Famous movie quotes
SAMPLE_DATASET = [
    {"id": 1, "text": "May the Force be with you.", "source": "Star Wars (1977)"},
    {"id": 2, "text": "There's no place like home.", "source": "The Wizard of Oz (1939)"},
    {"id": 3, "text": "I'm the king of the world!", "source": "Titanic (1997)"},
    {"id": 4, "text": "You can't handle the truth!", "source": "A Few Good Men (1992)"},
    {"id": 5, "text": "Life is like a box of chocolates.", "source": "Forrest Gump (1994)"},
    {"id": 6, "text": "I'll be back.", "source": "The Terminator (1984)"},
    {"id": 7, "text": "Here's looking at you, kid.", "source": "Casablanca (1942)"},
    {"id": 8, "text": "To infinity and beyond!", "source": "Toy Story (1995)"},
    {"id": 9, "text": "You talking to me?", "source": "Taxi Driver (1976)"},
    {"id": 10, "text": "I see dead people.", "source": "The Sixth Sense (1999)"},
    {"id": 11, "text": "Houston, we have a problem.", "source": "Apollo 13 (1995)"},
    {"id": 12, "text": "Just keep swimming.", "source": "Finding Nemo (2003)"},
    {"id": 13, "text": "Why so serious?", "source": "The Dark Knight (2008)"},
    {"id": 14, "text": "I'm going to make him an offer he can't refuse.", "source": "The Godfather (1972)"},
    {"id": 15, "text": "There's no crying in baseball!", "source": "A League of Their Own (1992)"},
    {"id": 16, "text": "E.T. phone home.", "source": "E.T. the Extra-Terrestrial (1982)"},
    {"id": 17, "text": "Show me the money!", "source": "Jerry Maguire (1996)"},
    {"id": 18, "text": "I feel the need—the need for speed!", "source": "Top Gun (1986)"},
    {"id": 19, "text": "My precious.", "source": "The Lord of the Rings (2001)"},
    {"id": 20, "text": "Keep your friends close, but your enemies closer.", "source": "The Godfather Part II (1974)"},
]

# Cache embeddings to avoid repeated API calls
_embeddings_cache = None

def semantic_search(client, query: str, dataset: List[dict], top_k: int = 5):
    """Search dataset using semantic similarity."""
    global _embeddings_cache
    
    # Create embeddings for dataset if not cached
    if _embeddings_cache is None:
        _embeddings_cache = []
        for item in dataset:
            embedding = get_embedding(client, item["text"])
            _embeddings_cache.append(embedding)
    
    # Get query embedding
    query_embedding = get_embedding(client, query)
    
    # Calculate similarities
    similarities = cosine_similarity([query_embedding], _embeddings_cache)[0]
    
    # Get top k indices
    top_indices = np.argsort(similarities)[-top_k:][::-1]
    
    # Return results with scores
    results = []
    for idx in top_indices:
        results.append({
            **dataset[idx],
            "similarity": float(similarities[idx])
        })
    
    return results
