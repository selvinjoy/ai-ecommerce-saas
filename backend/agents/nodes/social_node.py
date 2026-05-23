"""
Module 2 - Social Media Setup Node
Registers and configures brand social media handles on Meta and TikTok.
"""

import logging
from agents.state import AgentState

logger = logging.getLogger(__name__)


async def social_node(state: AgentState) -> AgentState:
    """
    Configure social media presence for the brand.
    Note: Automated social account creation requires approved developer access
    for each platform API. This node prepares the handles and stores them
    in state for manual registration or platform-specific automation.
    """
    logger.info(f"[social_node] Setting up social handles for pipeline: {state['pipeline_id']}")

    brand = state.get("brand_name", "").lower().replace(" ", "")

    # Generate handle suggestions
    social_handles = {
        "instagram": f"@{brand}official",
        "tiktok": f"@{brand}official",
        "facebook_page": f"{brand.title()} Official",
        "youtube": f"{brand.title()} Brand",
        "pinterest": f"{brand}brand",
    }

    # Bio templates
    bio_template = (
        f"{state.get('brand_tagline', '')} | "
        f"Shop now: {state.get('shopify_store_url', 'link in bio')}"
    )

    logger.info(f"[social_node] Handles prepared: {social_handles}")

    return {
        **state,
        "social_handles": {
            **social_handles,
            "bio_template": bio_template,
        },
    }
