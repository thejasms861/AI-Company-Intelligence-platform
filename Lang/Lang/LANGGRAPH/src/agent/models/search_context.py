from typing import List

def get_search_context(company_name: str, fields: List[str]) -> str:
    """
    Fetches raw information from the web (e.g., using Tavily, Google Search, Firecrawl)
    to feed into the 3 LLMs as ground-truth context.
    """
    # This ensures the LLMs aren't hallucinating and are basing their extraction
    # on the exact same retrieved data.
    
    # Placeholder for web search logic:
    # return firecrawl_or_tavily_search(f"{company_name} " + " ".join(fields))
    
    return f"Raw web scraped context for {company_name} regarding {', '.join(fields)}"
