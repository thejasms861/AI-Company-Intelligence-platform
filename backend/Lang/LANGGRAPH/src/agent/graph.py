from langgraph.graph import StateGraph, END
from src.agent.state import AgentState
from src.agent.nodes.generation import research_agent_node
from src.agent.nodes.consolidation import consolidation_node
from src.agent.nodes.validation import validation_node
from src.agent.nodes.router import route_validation

def create_pipeline() -> StateGraph:
    workflow = StateGraph(AgentState)

    workflow.add_node("research", research_agent_node)
    workflow.add_node("consolidate", consolidation_node)
    workflow.add_node("validate", validation_node)

    workflow.set_entry_point("research")
    workflow.add_edge("research", "consolidate")
    workflow.add_edge("consolidate", "validate")
    
    workflow.add_conditional_edges(
        "validate",
        route_validation,
        {
            "pass": END,
            "regenerate": "research",
            "review": END
        }
    )

    return workflow.compile()
