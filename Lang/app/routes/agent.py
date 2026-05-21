import uuid
from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from app.models.api import GenerateRequest, GenerateResponse, RunStatus
from app.storage.run_store import run_store
from app.service import agent_service

router = APIRouter(prefix="/v1/agent", tags=["agent"])


@router.post("/generate", status_code=202)
async def generate_agent(request: GenerateRequest, background_tasks: BackgroundTasks):
    """Start a background research job and return a run_id to poll for status."""
    run_id = str(uuid.uuid4())
    run_store.create_run(run_id, request.company_name)
    background_tasks.add_task(agent_service.execute_graph, run_id, request.company_name)
    return JSONResponse(status_code=202, content={
        "run_id": run_id,
        "status": "queued",
        "message": f"Research started for '{request.company_name}'. Poll /v1/agent/status/{run_id} for results."
    })


@router.post("/generate/sync")
async def generate_agent_sync(request: GenerateRequest):
    """Run the full research pipeline synchronously and return all 163 parameters."""
    run_id = str(uuid.uuid4())
    run_store.create_run(run_id, request.company_name)
    await agent_service.execute_graph(run_id, request.company_name)
    run = run_store.get_run(run_id)
    if not run:
        raise HTTPException(status_code=500, detail="Run not found after execution.")
    return JSONResponse(content=run.to_dict())


@router.get("/status/{run_id}")
async def get_run_status(run_id: str):
    """Poll the status of an async research job. Returns the full golden_record when completed."""
    run = run_store.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail=f"Run ID '{run_id}' not found.")
    return JSONResponse(content=run.to_dict())


@router.get("/status")
async def get_all_statuses():
    """List all active and completed research runs."""
    return JSONResponse(content=[r.to_dict() for r in run_store.get_all()])
