import httpx
from typing import Dict, Any
from app.providers.base import BaseLLMProvider
from app.core.errors import RateLimitError, ProviderError, TimeoutError, FatalError
from app.config.settings import settings

class GeminiProvider(BaseLLMProvider):
    def __init__(self):
        self.api_keys = [k.strip() for k in settings.GOOGLE_API_KEY.split(",") if k.strip()]
        if not self.api_keys:
            raise FatalError("GOOGLE_API_KEY is not set.")
        self.current_key_idx = 0
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

    def rotate_key(self):
        self.current_key_idx = (self.current_key_idx + 1) % len(self.api_keys)

    async def generate(self, prompt: str, model: str, **kwargs) -> str:
        last_error = None
        for _ in range(len(self.api_keys)):
            api_key = self.api_keys[self.current_key_idx]
            url = self.base_url.format(model=model) + f"?key={api_key}"
            headers = {
                "Content-Type": "application/json"
            }
            payload = {
                "contents": [{"parts": [{"text": prompt}]}]
            }
            
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        url,
                        json=payload,
                        headers=headers,
                        timeout=httpx.Timeout(60.0)
                    )
                    
                if response.status_code == 429:
                    self.rotate_key()
                    last_error = RateLimitError(f"Gemini Rate Limit: {response.text}")
                    continue
                elif response.status_code in (401, 403):
                    self.rotate_key()
                    last_error = FatalError(f"Gemini Auth Error: {response.text}")
                    continue
                elif response.status_code >= 400:
                    raise ProviderError(f"Gemini Error ({response.status_code}): {response.text}")
                    
                data = response.json()
                
                # Gemini response extraction
                try:
                    content = data["candidates"][0]["content"]["parts"][0]["text"]
                    return content
                except (KeyError, IndexError) as e:
                    raise ProviderError(f"Gemini unexpected response format: {data}")
                
            except httpx.TimeoutException as e:
                raise TimeoutError(f"Gemini request timed out: {str(e)}")
            except httpx.RequestError as e:
                raise ProviderError(f"Gemini request failed: {str(e)}")
                
        raise last_error or ProviderError("All Gemini API keys failed.")
