from langgraph.graph import StateGraph, START, END
from app.core.state import AgentState
from app.core.schema_parser import get_all_parameters
from app.nodes.research import research_node
from app.nodes.validation import validation_node
from app.nodes.consolidation import consolidation_node
from app.nodes.router import regeneration_router, increment_retry_node
from app.nodes.save import save_node
from app.core.logger import logger

import os
SCHEMA_FILE = os.path.join(os.path.dirname(__file__), "config", "schema.tsv")

def entry_node(state: AgentState) -> AgentState:
    logger.info(f"\\n[Phase 1] ENTRY NODE: Starting Agent Pipeline for '{state['company_name']}'")
    retry_count = state.get("retry_count", 0)
    failed_params = state.get("failed_parameters")
    if failed_params is None:
        failed_params = get_all_parameters(SCHEMA_FILE)
    
    return {
        "retry_count": retry_count,
        "failed_parameters": failed_params
    }

def build_graph():
    workflow = StateGraph(AgentState)

    # 1. Add all nodes
    workflow.add_node("entry_node", entry_node)
    workflow.add_node("research_node", research_node)
    workflow.add_node("validation_node", validation_node)
    workflow.add_node("consolidation_node", consolidation_node)
    workflow.add_node("increment_retry_node", increment_retry_node)
    workflow.add_node("save_node", save_node)

    # 2. Define standard sequential edges
    workflow.add_edge(START, "entry_node")
    workflow.add_edge("entry_node", "research_node")
    workflow.add_edge("research_node", "validation_node")
    workflow.add_edge("validation_node", "consolidation_node")

    # 3. Define the conditional edge for routing (Phase 5)
    workflow.add_conditional_edges(
        "consolidation_node",
        regeneration_router,
        {
            "regenerate": "increment_retry_node",
            "save": "save_node"
        }
    )

    workflow.add_edge("increment_retry_node", "research_node")
    workflow.add_edge("save_node", END)

    return workflow.compile()

# Expose compiled graph globally
graph = build_graph()
