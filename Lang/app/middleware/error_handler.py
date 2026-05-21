from fastapi import Request
from fastapi.responses import JSONResponse
from app.core.logger import logger

class ProviderError(Exception):
    pass

class GraphExecutionError(Exception):
    pass

async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error for {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred."}
    )

async def provider_error_handler(request: Request, exc: ProviderError):
    logger.error(f"Provider error: {exc}")
    return JSONResponse(
        status_code=502,
        content={"detail": "Failed to communicate with LLM provider.", "error": str(exc)}
    )

async def graph_execution_error_handler(request: Request, exc: GraphExecutionError):
    logger.error(f"Graph execution error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Graph execution failed.", "error": str(exc)}
    )

def setup_exception_handlers(app):
    app.add_exception_handler(Exception, global_exception_handler)
    app.add_exception_handler(ProviderError, provider_error_handler)
    app.add_exception_handler(GraphExecutionError, graph_execution_error_handler)
