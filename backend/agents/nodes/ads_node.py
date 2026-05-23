"""
Module 3 - Ads Launch Node
Launches campaigns on Meta and TikTok via their Marketing APIs.
"""

import logging
from agents.state import AgentState, PipelineStatus
from services.meta_service import MetaService
from services.tiktok_service import TikTokService

logger = logging.getLogger(__name__)

# Stop-loss thresholds
STOP_LOSS_SPEND_AUD = 200.0
STOP_LOSS_MIN_ROAS = 1.5
STOP_LOSS_MAX_CPC_AUD = 2.50


async def ads_node(state: AgentState) -> AgentState:
    """Launch Meta and TikTok ad campaigns."""
    logger.info(f"[ads_node] Launching campaigns for pipeline: {state['pipeline_id']}")
    meta = MetaService()
    tiktok = TikTokService()

    try:
        product = state["selected_product"]
        brand = state["brand_name"]
        store_url = state["shopify_store_url"]

        # 1. Launch Meta campaign
        meta_campaign = await meta.create_campaign(
            name=f"{brand} - Conversions",
            objective="OUTCOME_SALES",
            daily_budget_aud=30.0,
            destination_url=store_url,
            product_name=product["product_name"],
        )

        # 2. Launch TikTok campaign
        tiktok_campaign = await tiktok.create_campaign(
            name=f"{brand} - TikTok Sales",
            objective="CONVERSIONS",
            daily_budget_aud=20.0,
            destination_url=store_url,
        )

        return {
            **state,
            "pipeline_status": PipelineStatus.ADS_LIVE,
            "meta_campaign_id": meta_campaign["id"],
            "tiktok_campaign_id": tiktok_campaign["campaign_id"],
            "ad_spend_total": 0.0,
            "stop_loss_triggered": False,
        }

    except Exception as e:
        logger.error(f"[ads_node] Error: {e}")
        return {
            **state,
            "pipeline_status": PipelineStatus.FAILED,
            "errors": state.get("errors", []) + [str(e)],
        }
