"""
Module 4 - Supplier Sourcing Node
Queries Zendrop API for best supplier based on price, stock, and shipping time.
"""

import logging
from agents.state import AgentState, PipelineStatus
from services.zendrop_service import ZendropService

logger = logging.getLogger(__name__)


async def supplier_node(state: AgentState) -> AgentState:
    """Find best supplier for the selected product via Zendrop."""
    logger.info(f"[supplier_node] Sourcing supplier for pipeline: {state['pipeline_id']}")
    zendrop = ZendropService()

    try:
        product = state["selected_product"]

        # Search for matching products on Zendrop
        suppliers = await zendrop.search_products(
            query=product["product_name"],
            category=product["category"],
        )

        if not suppliers:
            raise ValueError(f"No suppliers found for: {product['product_name']}")

        # Score and select best supplier
        # Priority: lowest cost -> fastest shipping -> highest rating
        best = sorted(
            suppliers,
            key=lambda s: (s["unit_cost"], s["shipping_days"], -s.get("rating", 0))
        )[0]

        logger.info(
            f"[supplier_node] Best supplier: {best['supplier_name']} "
            f"Cost=AUD${best['unit_cost']} Ship={best['shipping_days']}d"
        )

        return {
            **state,
            "pipeline_status": PipelineStatus.FULFILLING,
            "supplier_data": best,
            "unit_cost": best["unit_cost"],
            "shipping_days": best["shipping_days"],
        }

    except Exception as e:
        logger.error(f"[supplier_node] Error: {e}")
        return {
            **state,
            "pipeline_status": PipelineStatus.FAILED,
            "errors": state.get("errors", []) + [str(e)],
        }
