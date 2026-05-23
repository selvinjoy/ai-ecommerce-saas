"""
Module 1 - Product Discovery & Market Research Node
Scrapes social media trends and Reddit, then uses GPT-4o to score products.
"""

import logging
from agents.state import AgentState, PipelineStatus
from services.apify_service import ApifyService
from services.openai_service import OpenAIService

logger = logging.getLogger(__name__)


PRODUCT_SCORING_PROMPT = """
You are an expert e-commerce product analyst. Analyse the following social media trends
and Reddit pain points for the target market: {target_market}.

Trending data:
{trends}

Reddit pain points:
{pain_points}

Score the top 5 product opportunities using these weighted criteria:
1. Trend velocity (30%) - How fast is engagement growing?
2. Pain point density (25%) - How many people complain about the problem?
3. Supplier availability (20%) - Can this be dropshipped easily?
4. Profit margin potential (15%) - Typical markup feasibility.
5. Competition level (10%) - Is the market saturated?

Return a JSON array of 5 products with keys:
- product_name, category, score (0-100), pain_points_addressed,
  trend_summary, estimated_margin_pct, competition_level
"""


async def research_node(state: AgentState) -> AgentState:
    """Execute product research and scoring."""
    logger.info(f"[research_node] Starting for pipeline: {state['pipeline_id']}")
    apify = ApifyService()
    openai = OpenAIService()

    try:
        # 1. Scrape TikTok trending products
        tiktok_trends = await apify.scrape_tiktok_trends()

        # 2. Scrape Reddit pain points
        reddit_data = await apify.scrape_reddit_pain_points(
            subreddits=["amazonreviews", "BuyItForLife", "malegrooming", "femalefashionadvice"]
        )

        # 3. Scrape Amazon Best Sellers
        amazon_bsr = await apify.scrape_amazon_bsr()

        combined_trends = tiktok_trends + amazon_bsr

        # 4. Score products using GPT-4o
        scored = await openai.score_products(
            prompt_template=PRODUCT_SCORING_PROMPT,
            trends=combined_trends,
            pain_points=reddit_data,
            target_market=state.get("target_market", "AU"),
        )

        return {
            **state,
            "pipeline_status": PipelineStatus.AWAITING_GATEWAY_1,
            "raw_trends": combined_trends,
            "reddit_pain_points": reddit_data,
            "scored_products": scored,
        }

    except Exception as e:
        logger.error(f"[research_node] Error: {e}")
        return {
            **state,
            "pipeline_status": PipelineStatus.FAILED,
            "errors": state.get("errors", []) + [str(e)],
        }
