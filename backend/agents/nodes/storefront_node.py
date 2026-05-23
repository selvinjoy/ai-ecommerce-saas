"""
Module 2 - Storefront Generation Node
Programmatically creates a Shopify store using GraphQL Admin API.
"""

import logging
from agents.state import AgentState, PipelineStatus
from services.shopify_service import ShopifyService
from services.openai_service import OpenAIService

logger = logging.getLogger(__name__)


BRAND_GENERATION_PROMPT = """
You are a world-class brand strategist. Generate a brand identity for a product with:
- Product: {product_name}
- Category: {category}
- Pain points addressed: {pain_points}
- Target market: {target_market}

Return JSON with:
- brand_name (catchy, memorable, max 2 words)
- tagline (max 8 words)
- product_title (SEO-optimised, max 10 words)
- product_description (150 words, highlights pain point solutions)
- meta_description (max 160 characters)
- price_aud (suggested retail price in AUD)
"""


async def storefront_node(state: AgentState) -> AgentState:
    """Create Shopify storefront for approved product."""
    logger.info(f"[storefront_node] Creating store for pipeline: {state['pipeline_id']}")
    shopify = ShopifyService()
    openai = OpenAIService()

    try:
        product = state["selected_product"]

        # 1. Generate brand identity
        brand_data = await openai.generate_brand(
            prompt_template=BRAND_GENERATION_PROMPT,
            product_name=product["product_name"],
            category=product["category"],
            pain_points=product["pain_points_addressed"],
            target_market=state.get("target_market", "AU"),
        )

        # 2. Create Shopify product via GraphQL
        shopify_product = await shopify.create_product(
            title=brand_data["product_title"],
            description=brand_data["product_description"],
            price=brand_data["price_aud"],
            vendor=brand_data["brand_name"],
        )

        # 3. Configure store metadata
        await shopify.update_store_metadata(
            name=brand_data["brand_name"],
            description=brand_data["tagline"],
        )

        return {
            **state,
            "pipeline_status": PipelineStatus.STOREFRONT,
            "brand_name": brand_data["brand_name"],
            "brand_tagline": brand_data["tagline"],
            "shopify_product_id": shopify_product["id"],
            "shopify_store_url": shopify.store_url,
        }

    except Exception as e:
        logger.error(f"[storefront_node] Error: {e}")
        return {
            **state,
            "pipeline_status": PipelineStatus.FAILED,
            "errors": state.get("errors", []) + [str(e)],
        }
