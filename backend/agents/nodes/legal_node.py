"""
Module 4 - Legal & Compliance Node
Calculates Australian GST, import duties, and generates compliance checklist.
"""

import logging
from agents.state import AgentState, PipelineStatus

logger = logging.getLogger(__name__)

# Australian tax constants
GST_RATE = 0.10  # 10%
DE_MINIMIS_AUD = 1000.0  # GST applies on all imports to AU (LVT removed July 2018)

# Common duty rates by category (simplified)
DUTY_RATES = {
    "electronics": 0.00,
    "clothing": 0.05,
    "cosmetics": 0.00,
    "toys": 0.00,
    "fitness": 0.00,
    "kitchen": 0.00,
    "default": 0.05,
}


async def legal_node(state: AgentState) -> AgentState:
    """Calculate compliance requirements for Australian market."""
    logger.info(f"[legal_node] Running compliance checks for pipeline: {state['pipeline_id']}")

    try:
        unit_cost = state.get("unit_cost", 0)
        category = state["selected_product"].get("category", "default").lower()
        target_market = state.get("target_market", "AU")

        # Calculate duty rate
        duty_rate = DUTY_RATES.get(category, DUTY_RATES["default"])
        import_duty = unit_cost * duty_rate

        # AU GST applies on all imports (Low Value Threshold removed 2018)
        gst_applicable = target_market == "AU"
        gst_amount = (unit_cost + import_duty) * GST_RATE if gst_applicable else 0

        landed_cost = unit_cost + import_duty + gst_amount

        # Generate compliance checklist
        checklist = [
            f"[AU] ABN registration required for business operations",
            f"[AU] GST registration required if annual turnover > AUD $75,000",
            f"[AU] GST ({int(GST_RATE*100)}%) applies on import value: AUD ${gst_amount:.2f} per unit",
            f"[AU] Import duty rate for '{category}': {int(duty_rate*100)}% = AUD ${import_duty:.2f} per unit",
            f"[AU] Australian Consumer Law (ACL) - mandatory warranty obligations apply",
            f"[AU] Product safety standards - comply with relevant AS/NZS standards",
            f"[AU] Privacy Act 1988 - ensure privacy policy on Shopify store",
            f"[AU] Spam Act 2003 - obtain consent for email marketing",
            f"[AU] Customs entry required for commercial imports > AUD $1,000 per shipment",
            f"[AU] Landed cost per unit: AUD ${landed_cost:.2f} (cost + duty + GST)",
        ]

        logger.info(f"[legal_node] Landed cost: AUD${landed_cost:.2f} | GST: AUD${gst_amount:.2f}")

        return {
            **state,
            "pipeline_status": PipelineStatus.COMPLETED,
            "gst_applicable": gst_applicable,
            "import_duty_rate": duty_rate,
            "compliance_checklist": checklist,
        }

    except Exception as e:
        logger.error(f"[legal_node] Error: {e}")
        return {
            **state,
            "pipeline_status": PipelineStatus.FAILED,
            "errors": state.get("errors", []) + [str(e)],
        }
