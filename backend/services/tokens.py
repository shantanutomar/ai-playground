import tiktoken
from typing import List

# Token pricing (per 1K tokens) - as of 2024
PRICING = {
    "gpt-4": {"input": 0.03, "output": 0.06},
    "gpt-3.5-turbo": {"input": 0.0015, "output": 0.002},
    "gpt-4-turbo": {"input": 0.01, "output": 0.03},
}

def get_encoding(model: str):
    """Get the appropriate encoding for a model."""
    try:
        return tiktoken.encoding_for_model(model)
    except KeyError:
        return tiktoken.get_encoding("cl100k_base")

def count_tokens(text: str, model: str = "gpt-4"):
    """Count tokens in text for a specific model."""
    encoding = get_encoding(model)
    tokens = encoding.encode(text)
    count = len(tokens)
    
    # Calculate cost (input tokens only, as estimation)
    cost_per_1k = PRICING.get(model, PRICING["gpt-4"])["input"]
    estimated_cost = (count / 1000) * cost_per_1k
    
    return {
        "count": count,
        "cost": round(estimated_cost, 6),
        "model": model
    }

def tokenize_text(text: str, model: str = "gpt-4") -> List[str]:
    """Tokenize text and return list of token strings."""
    encoding = get_encoding(model)
    tokens = encoding.encode(text)
    
    # Decode each token to get string representation
    token_strings = []
    for token in tokens:
        try:
            token_str = encoding.decode([token])
            token_strings.append(token_str)
        except:
            token_strings.append(f"[{token}]")
    
    return token_strings
