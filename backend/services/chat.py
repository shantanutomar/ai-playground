from typing import List, Optional

def chat_completion(
    client,
    messages: List[dict],
    temperature: float = 0.7,
    max_tokens: int = 500,
    system_prompt: Optional[str] = None
):
    """Generate chat completion."""
    # Prepend system prompt if provided
    if system_prompt:
        messages = [{"role": "system", "content": system_prompt}] + messages
    
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens
    )
    
    return {
        "message": response.choices[0].message.content,
        "usage": {
            "prompt_tokens": response.usage.prompt_tokens,
            "completion_tokens": response.usage.completion_tokens,
            "total_tokens": response.usage.total_tokens
        }
    }
