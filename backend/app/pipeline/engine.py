import asyncio
from typing import List, Dict, Any
from app.core.rate_limiter import global_rate_limiter
from app.core.errors import ValidationError
from app.providers.factory import global_provider_factory
from app.pipeline.batcher import chunk_parameters
from app.pipeline.validators import extract_json_robustly, validate_response_keys
from app.config.prompts import RESEARCH_PROMPT_TEMPLATE
from app.core.schema_parser import get_validation_rules
from app.config.settings import settings
from app.core.logger import logger

async def fetch_chunk(
    company: str, 
    chunk: List[str], 
    provider_name: str, 
    model: str, 
    fallback_model: str,
    rules: Dict[str, Any],
    live_context: str = "No recent web data fetched."
) -> Dict[str, Any]:
    """
    Fetches a specific chunk of parameters using the specified provider.
    Respects rate limits, applies robust retries, and validates the output.
    """
    limiter = global_rate_limiter.get_limiter(provider_name)
    
    # Wait for capacity
    await limiter.acquire()
    try:
        # Build prompt
        schema_lines = []
        for p in chunk:
            r = rules.get(p, {})
            ac = r.get("type", "Atomic")
            min_v = r.get("min", 1)
            max_v = r.get("max", 999)
            if ac == "Composite":
                schema_lines.append(f"- {p} (Composite, Min: {min_v}, Max: {max_v})")
            else:
                schema_lines.append(f"- {p} (Atomic, Single Value)")
                
        schema_chunk = "\n".join(schema_lines)
        prompt = RESEARCH_PROMPT_TEMPLATE.format(
            company_name=company, 
            schema_chunk=schema_chunk, 
            live_context=live_context
        )
        
        # Hit Provider with Retry & Fallback
        response_text = await global_provider_factory.generate_with_retry(
            provider_name=provider_name,
            prompt=prompt,
            model=model,
            fallback_model=fallback_model
        )
        
        # Validate and extract
        raw_json = extract_json_robustly(response_text)
        validated_json = validate_response_keys(expected_keys=chunk, actual_data=raw_json)
        
        return validated_json
        
    except ValidationError as ve:
        logger.error(f"Validation Error for {provider_name} on {company}: {ve}")
        return {p: "Not Found" for p in chunk}
    except Exception as e:
        logger.exception(f"Fatal/Uncaught Error for {provider_name} on {company}: {e}")
        return {p: "Not Found" for p in chunk}
    finally:
        limiter.release()

async def run_parallel_research_engine(company_name: str, params_to_research: List[str], live_context: str = "No recent web data fetched.") -> Dict[str, Any]:
    """
    Master orchestrator for the research phase.
    Queues all chunks and fires off async worker tasks across all providers.
    """
    chunks = chunk_parameters(params_to_research)
    rules = get_validation_rules(settings.SCHEMA_FILE)
    
    # Define our providers and models
    provider_configs = [
        {"name": "gemini", "model": settings.DEFAULT_GEMINI_MODEL, "fallback": None},
        {"name": "groq", "model": "mixtral-8x7b-32768", "fallback": "llama-3.1-8b-instant"},
        {"name": "groq", "model": "llama-3.1-8b-instant", "fallback": "gemma2-9b-it"},
    ]
    
    tasks = []
    
    for i, pconf in enumerate(provider_configs):
        llm_key = f"llm_{i+1}"
        for chunk in chunks:
            # Create a task for this chunk and this provider
            task = asyncio.create_task(
                fetch_chunk(
                    company=company_name,
                    chunk=chunk,
                    provider_name=pconf["name"],
                    model=pconf["model"],
                    fallback_model=pconf["fallback"],
                    rules=rules,
                    live_context=live_context
                )
            )
            tasks.append((llm_key, task))
            
    # Await all chunks across all providers concurrently
    await asyncio.gather(*(t[1] for t in tasks))
    
    # Reassemble results
    all_results = {"llm_1": {}, "llm_2": {}, "llm_3": {}}
    for llm_key, task in tasks:
        chunk_result = task.result()
        all_results[llm_key].update(chunk_result)
        
    return all_results
