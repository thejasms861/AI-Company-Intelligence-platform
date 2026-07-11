from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from enum import Enum
from app.models.golden_record import GoldenRecordModel

class RunStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class GenerateRequest(BaseModel):
    company_name: str

class GenerateResponse(BaseModel):
    run_id: str
    status: RunStatus
    message: str

class RunStatusResponse(BaseModel):
    run_id: str
    status: RunStatus
    progress: int
    company_name: str
    golden_record: Optional[GoldenRecordModel] = None
    failed_parameters: Optional[List[str]] = None
    error: Optional[str] = None
