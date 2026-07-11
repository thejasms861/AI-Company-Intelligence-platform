import httpx
from typing import Dict, Any
from app.providers.base import BaseLLMProvider
from app.core.errors import RateLimitError, ProviderError, TimeoutError, FatalError
from app.config.settings import settings

class GroqProvider(BaseLLMProvider):
    def __init__(self):
        self.api_keys = [k.strip() for k in settings.GROQ_API_KEY.split(",") if k.strip()]
        if not self.api_keys:
            raise FatalError("GROQ_API_KEY is not set.")
        self.current_key_idx = 0
        self.base_url = "https://api.groq.com/openai/v1/chat/completions"

    def rotate_key(self):
        self.current_key_idx = (self.current_key_idx + 1) % len(self.api_keys)

    async def generate(self, prompt: str, model: str, **kwargs) -> str:
        last_error = None
        for _ in range(len(self.api_keys)):
            api_key = self.api_keys[self.current_key_idx]
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": model,
                "messages": [{"role": "system", "content": prompt}],
                **kwargs
            }
            
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        self.base_url,
                        json=payload,
                        headers=headers,
                        timeout=httpx.Timeout(60.0)
                    )
                    
                if response.status_code == 429:
                    self.rotate_key()
                    last_error = RateLimitError(f"Groq Rate Limit: {response.text}")
                    continue
                elif response.status_code in (401, 403):
                    self.rotate_key()
                    last_error = FatalError(f"Groq Auth Error: {response.text}")
                    continue
                elif response.status_code >= 400:
                    raise ProviderError(f"Groq Error ({response.status_code}): {response.text}")
                    
                data = response.json()
                return data["choices"][0]["message"]["content"]
                
            except httpx.TimeoutException as e:
                raise TimeoutError(f"Groq request timed out: {str(e)}")
            except httpx.RequestError as e:
                raise ProviderError(f"Groq request failed: {str(e)}")
                
        raise last_error or ProviderError("All Groq API keys failed.")
