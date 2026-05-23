"""
Module 3 - Marketing Strategy Generation Node
Generates a UGC-first marketing strategy using GPT-4o.
"""

import logging
from agents.state import AgentState, PipelineStatus
from services.openai_service import OpenAIService

logger = logging.getLogger(__name__)


MARKETING_STRATEGY_PROMPT = """
You are an expert e-commerce marketing strategist specialising in UGC and social commerce.
Create a comprehensive marketing strategy for:

Brand: {brand_name}
Tagline: {brand_tagline}
Product: {product_name}
Target market: {target_market}
Store URL: {store_url}

Deliver a strategy document covering:
1. Brand Story & Values (2 paragraphs)
2. Target Audience Persona (age, interests, platforms)
3. UGC Content Strategy (5 video concepts with hooks)
4. TikTok Ad Strategy (campaign objective, budget split, creative brief)
5. Meta Ad Strategy (campaign objective, audience targeting, creative brief)
6. Influencer Outreach Template
7. Comment Engagement Scripts (10 reply templates)
8. KPI Targets: ROAS >= 2.5, CPC <= AUD $1.50, CTR >= 2%
9. Stop-loss rule: Pause if ROAS < 1.5 after AUD $200 spend
"""


async def marketing_node(state: AgentState) -> AgentState:
    """Generate UGC marketing strategy for the brand."""
    logger.info(f"[marketing_node] Generating strategy for pipeline: {state['pipeline_id']}")
    openai = OpenAIService()

    try:
        strategy = await openai.generate_marketing_strategy(
            prompt_template=MARKETING_STRATEGY_PROMPT,
            brand_name=state["brand_name"],
            brand_tagline=state["brand_tagline"],
            product_name=state["selected_product"]["product_name"],
            target_market=state.get("target_market", "AU"),
            store_url=state["shopify_store_url"],
        )

        return {
            **state,
            "pipeline_status": PipelineStatus.AWAITING_GATEWAY_2,
            "marketing_strategy": strategy,
        }

    except Exception as e:
        logger.error(f"[marketing_node] Error: {e}")
        return {
            **state,
            "pipeline_status": PipelineStatus.FAILED,
            "errors": state.get("errors", []) + [str(e)],
        }
