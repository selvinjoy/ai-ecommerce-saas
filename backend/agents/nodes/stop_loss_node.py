"""
Module 3 - Stop-Loss Monitoring Node
Polls ad KPIs and auto-pauses campaigns when thresholds are breached.
"""

import logging
from agents.state import AgentState, PipelineStatus
from services.meta_service import MetaService
from services.tiktok_service import TikTokService

logger = logging.getLogger(__name__)

STOP_LOSS_SPEND_THRESHOLD = 200.0  # AUD
MIN_ROAS = 1.5
MAX_CPC_AUD = 2.50


async def stop_loss_node(state: AgentState) -> AgentState:
    """
    Check ad performance KPIs.
    Pauses campaigns and flags stop_loss_triggered=True if thresholds are breached.
    """
    logger.info(f"[stop_loss_node] Checking KPIs for pipeline: {state['pipeline_id']}")
    meta = MetaService()
    tiktok = TikTokService()

    try:
        # Fetch latest metrics
        meta_metrics = await meta.get_campaign_metrics(state["meta_campaign_id"])
        tiktok_metrics = await tiktok.get_campaign_metrics(state["tiktok_campaign_id"])

        total_spend = meta_metrics["spend"] + tiktok_metrics["spend"]
        blended_roas = (
            (meta_metrics.get("roas", 0) + tiktok_metrics.get("roas", 0)) / 2
        )
        blended_cpc = (
            (meta_metrics.get("cpc", 0) + tiktok_metrics.get("cpc", 0)) / 2
        )

        stop_loss = False

        # Evaluate stop-loss rule
        if total_spend >= STOP_LOSS_SPEND_THRESHOLD:
            if blended_roas < MIN_ROAS or blended_cpc > MAX_CPC_AUD:
                logger.warning(
                    f"[stop_loss_node] STOP LOSS TRIGGERED "
                    f"ROAS={blended_roas:.2f} CPC={blended_cpc:.2f} Spend=AUD${total_spend:.2f}"
                )
                # Pause both campaigns
                await meta.pause_campaign(state["meta_campaign_id"])
                await tiktok.pause_campaign(state["tiktok_campaign_id"])
                stop_loss = True

        return {
            **state,
            "pipeline_status": PipelineStatus.STOP_LOSS_TRIGGERED if stop_loss else PipelineStatus.MONITORING,
            "ad_spend_total": total_spend,
            "current_roas": blended_roas,
            "current_cpc": blended_cpc,
            "stop_loss_triggered": stop_loss,
        }

    except Exception as e:
        logger.error(f"[stop_loss_node] Error: {e}")
        return {
            **state,
            "errors": state.get("errors", []) + [str(e)],
        }
