import asyncio
from app.graph import graph
from app.storage.run_store import run_store
from app.models.api import RunStatus
from app.core.logger import logger
from app.middleware.error_handler import GraphExecutionError

class AgentService:
    @staticmethod
    async def execute_graph(run_id: str, company_name: str):
        try:
            run_store.update_run(run_id, status=RunStatus.RUNNING, progress=10)
            
            initial_state = {
                "company_name": company_name,
                "research_data": {},
                "validation_results": {},
                "golden_record": {},
                "retry_count": 0
            }
            
            # Progress mapping for nodes
            progress_map = {
                "entry_node": 20,
                "research_node": 40,
                "validation_node": 70,
                "consolidation_node": 80,
                "intelligence_node": 85,
                "increment_retry_node": 50, # Arbitrary fallback if retrying
                "save_node": 90
            }
            
            phase_map = {
                "entry_node": "Analyzing Company Setup...",
                "research_node": "Scraping Live Web Data...",
                "validation_node": "Validating Research Against Data Schema...",
                "consolidation_node": "Consolidating 163 Corporate Parameters...",
                "intelligence_node": "Generating Psychosocial AI Intelligence & Badges...",
                "increment_retry_node": "Retrying Failed Parameters...",
                "save_node": "Syncing to Live Supabase Database..."
            }
            
            final_state = None
            async for output in graph.astream(initial_state):
                for node_name, state in output.items():
                    logger.info(f"--- Completed Node: {node_name} ---")
                    final_state = state
                    
                    p_val = progress_map.get(node_name, None)
                    c_phase = phase_map.get(node_name, f"Processing {node_name}...")
                    run_store.update_run(run_id, progress=p_val, current_phase=c_phase)

            # Finalize run
            if final_state:
                run_store.update_run(
                    run_id,
                    status=RunStatus.COMPLETED,
                    progress=100,
                    golden_record=final_state.get("golden_record", {}),
                    failed_parameters=final_state.get("failed_parameters", [])
                )
            else:
                raise GraphExecutionError("No state output from graph execution.")

        except Exception as e:
            logger.error(f"Error during graph execution for {run_id}: {e}", exc_info=True)
            run_store.update_run(
                run_id,
                status=RunStatus.FAILED,
                error=str(e)
            )

agent_service = AgentService()
