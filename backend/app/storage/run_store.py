from typing import Dict, Any, Optional, List
from app.models.api import RunStatus


class RunRecord:
    """Lightweight container for a single run's data."""
    def __init__(self, run_id: str, company_name: str):
        self.run_id = run_id
        self.company_name = company_name
        self.status = RunStatus.QUEUED
        self.progress = 0
        self.current_phase = "Initializing Agent..."
        self.golden_record: Dict[str, Any] = {}
        self.failed_parameters: List[str] = []
        self.error: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        """Serialise to dict for JSON response. golden_record uses real parameter names."""
        return {
            "run_id": self.run_id,
            "status": self.status.value,
            "progress": self.progress,
            "current_phase": self.current_phase,
            "company_name": self.company_name,
            "golden_record": self.golden_record,
            "failed_parameters": self.failed_parameters,
            "error": self.error,
        }


class RunStore:
    def __init__(self):
        self._runs: Dict[str, RunRecord] = {}

    def create_run(self, run_id: str, company_name: str):
        self._runs[run_id] = RunRecord(run_id, company_name)

    def update_run(
        self,
        run_id: str,
        status: Optional[RunStatus] = None,
        progress: Optional[int] = None,
        current_phase: Optional[str] = None,
        golden_record: Optional[Dict[str, Any]] = None,
        failed_parameters: Optional[List[str]] = None,
        error: Optional[str] = None,
    ):
        run = self._runs.get(run_id)
        if not run:
            return
        if status is not None:
            run.status = status
        if progress is not None:
            run.progress = progress
        if current_phase is not None:
            run.current_phase = current_phase
        if golden_record is not None:
            # Store raw dict — LLM can return any type for a value
            run.golden_record = golden_record
        if failed_parameters is not None:
            run.failed_parameters = failed_parameters
        if error is not None:
            run.error = error
            run.status = RunStatus.FAILED

    def get_run(self, run_id: str) -> Optional[RunRecord]:
        return self._runs.get(run_id)

    def get_all(self):
        return list(self._runs.values())


# Singleton instance
run_store = RunStore()
