"""
Gateway 1 - Human-in-the-Loop: Product Go/No-Go Approval

The LangGraph graph uses interrupt_before=["gateway_1"] to pause execution here.
The FastAPI /gateway/approve endpoint resumes the graph with the user's decision.
"""

import logging
from agents.state import AgentState, PipelineStatus

logger = logging.getLogger(__name__)


async def gateway_1_node(state: AgentState) -> AgentState:
    """
    Gateway 1: Product approval checkpoint.

    This node is reached AFTER the graph is resumed via the API.
    By the time this node executes:
      - state['gateway_1_approved'] = True  -> proceed to storefront
      - state['gateway_1_approved'] = False -> pipeline ends
      - state['selected_product'] should be set by the user's selection

    The LangGraph interrupt_before mechanism pauses BEFORE this node runs,
    allowing the frontend to display scored products and capture the user decision.
    """
    logger.info(
        f"[gateway_1] Processing approval decision for pipeline: {state['pipeline_id']} "
        f"Approved: {state.get('gateway_1_approved')}"
    )

    if state.get("gateway_1_approved"):
        logger.info(f"[gateway_1] APPROVED - Product: {state.get('selected_product', {}).get('product_name')}")
        return {
            **state,
            "pipeline_status": PipelineStatus.STOREFRONT,
        }
    else:
        logger.info(f"[gateway_1] REJECTED - Pipeline will terminate")
        return {
            **state,
            "pipeline_status": PipelineStatus.FAILED,
        }
