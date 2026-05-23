"""\nLangGraph Pipeline Graph\nDefines the state machine with nodes, edges, and HITL interrupt gateways.\n"""

from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

from agents.state import AgentState, PipelineStatus
from agents.nodes.research_node import research_node
from agents.nodes.storefront_node import storefront_node
from agents.nodes.social_node import social_node
from agents.nodes.marketing_node import marketing_node
from agents.nodes.ads_node import ads_node
from agents.nodes.stop_loss_node import stop_loss_node
from agents.nodes.supplier_node import supplier_node
from agents.nodes.legal_node import legal_node
from agents.gateways.gateway_1 import gateway_1_node
from agents.gateways.gateway_2 import gateway_2_node


def should_proceed_after_gateway_1(state: AgentState) -> str:
    """Route after Gateway 1 approval."""
    if state.get("gateway_1_approved"):
        return "storefront"
    return END


def should_proceed_after_gateway_2(state: AgentState) -> str:
    """Route after Gateway 2 approval."""
    if state.get("gateway_2_approved"):
        return "ads"
    return END


def check_stop_loss(state: AgentState) -> str:
    """Route based on ad performance KPIs."""
    if state.get("stop_loss_triggered"):
        return END
    return "supplier"


def build_pipeline_graph() -> StateGraph:
    """Construct and compile the LangGraph pipeline."""
    workflow = StateGraph(AgentState)

    # --- Add Nodes ---
    workflow.add_node("research", research_node)
    workflow.add_node("gateway_1", gateway_1_node)
    workflow.add_node("storefront", storefront_node)
    workflow.add_node("social", social_node)
    workflow.add_node("marketing", marketing_node)
    workflow.add_node("gateway_2", gateway_2_node)
    workflow.add_node("ads", ads_node)
    workflow.add_node("stop_loss", stop_loss_node)
    workflow.add_node("supplier", supplier_node)
    workflow.add_node("legal", legal_node)

    # --- Entry Point ---
    workflow.set_entry_point("research")

    # --- Edges ---
    workflow.add_edge("research", "gateway_1")

    # HITL Gateway 1 - interrupt before this node
    workflow.add_conditional_edges(
        "gateway_1",
        should_proceed_after_gateway_1,
        {"storefront": "storefront", END: END},
    )

    workflow.add_edge("storefront", "social")
    workflow.add_edge("social", "marketing")
    workflow.add_edge("marketing", "gateway_2")

    # HITL Gateway 2 - interrupt before this node
    workflow.add_conditional_edges(
        "gateway_2",
        should_proceed_after_gateway_2,
        {"ads": "ads", END: END},
    )

    workflow.add_edge("ads", "stop_loss")

    workflow.add_conditional_edges(
        "stop_loss",
        check_stop_loss,
        {"supplier": "supplier", END: END},
    )

    workflow.add_edge("supplier", "legal")
    workflow.add_edge("legal", END)

    # Compile with memory checkpointer for HITL interrupts
    checkpointer = MemorySaver()
    return workflow.compile(
        checkpointer=checkpointer,
        interrupt_before=["gateway_1", "gateway_2"],
    )


# Singleton graph instance
pipeline_graph = build_pipeline_graph()
