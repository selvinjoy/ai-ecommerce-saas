"""
Gateway 2 - Human-in-the-Loop: Marketing Strategy Approval

The LangGraph graph uses interrupt_before=["gateway_2"] to pause execution here.
The FastAPI /gateway/approve endpoint resumes the graph with the user's decision.
"""

import logging
from agents.state import AgentState, PipelineStatus

logger = logging.getLogger(__name__)


async def gateway_2_node(state: AgentState) -> AgentState:
    """
    Gateway 2: Marketing strategy approval checkpoint.

    This node is reached AFTER the graph is resumed via the API.
    By the time this node executes:
      - state['gateway_2_approved'] = True  -> launch ad campaigns
      - state['gateway_2_approved'] = False -> pipeline pauses for revision

    The frontend displays the full marketing_strategy document and
    requests explicit user approval before any ad spend is committed.
    """
    logger.info(
        f"[gateway_2] Processing marketing strategy approval for pipeline: {state['pipeline_id']} "
        f"Approved: {state.get('gateway_2_approved')}"
    )

    if state.get("gateway_2_approved"):
        logger.info(f"[gateway_2] APPROVED - Launching ad campaigns for brand: {state.get('brand_name')}")
        return {
            **state,
            "pipeline_status": PipelineStatus.ADS_LIVE,
        }
    else:
        logger.info(f"[gateway_2] REJECTED - Marketing strategy requires revision")
        return {
            **state,
            "pipeline_status": PipelineStatus.MARKETING,
            "marketing_strategy": None,  # Reset for regeneration
        }
