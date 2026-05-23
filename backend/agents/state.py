"""\nAgentState - LangGraph TypedDict defining the shared state\npassed between all nodes in the e-commerce pipeline.\n"""

from typing import TypedDict, Optional, List, Any
from enum import Enum


class PipelineStatus(str, Enum):
    PENDING = "pending"
    RESEARCH = "research"
    AWAITING_GATEWAY_1 = "awaiting_gateway_1"
    STOREFRONT = "storefront"
    MARKETING = "marketing"
    AWAITING_GATEWAY_2 = "awaiting_gateway_2"
    ADS_LIVE = "ads_live"
    MONITORING = "monitoring"
    STOP_LOSS_TRIGGERED = "stop_loss_triggered"
    FULFILLING = "fulfilling"
    COMPLETED = "completed"
    FAILED = "failed"


class AgentState(TypedDict):
    # Pipeline metadata
    pipeline_id: str
    pipeline_status: PipelineStatus
    target_market: str  # e.g. "AU", "US"

    # Module 1: Product Research
    raw_trends: Optional[List[dict]]
    reddit_pain_points: Optional[List[str]]
    scored_products: Optional[List[dict]]
    selected_product: Optional[dict]
    gateway_1_approved: Optional[bool]

    # Module 2: Brand & Storefront
    brand_name: Optional[str]
    brand_tagline: Optional[str]
    shopify_store_url: Optional[str]
    shopify_product_id: Optional[str]
    social_handles: Optional[dict]  # {"instagram": "...", "tiktok": "..."}

    # Module 3: Marketing & Ads
    marketing_strategy: Optional[str]
    gateway_2_approved: Optional[bool]
    meta_campaign_id: Optional[str]
    tiktok_campaign_id: Optional[str]
    ad_spend_total: Optional[float]
    current_roas: Optional[float]
    current_cpc: Optional[float]
    stop_loss_triggered: Optional[bool]

    # Module 4: Supply Chain & Legal
    supplier_data: Optional[dict]
    unit_cost: Optional[float]
    shipping_days: Optional[int]
    gst_applicable: Optional[bool]
    import_duty_rate: Optional[float]
    compliance_checklist: Optional[List[str]]

    # Order Fulfilment
    zendrop_order_id: Optional[str]

    # Errors
    errors: Optional[List[str]]
