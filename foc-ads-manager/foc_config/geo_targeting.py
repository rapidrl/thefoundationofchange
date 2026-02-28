"""
Geographic Targeting Configuration
Focus on Ypsilanti/Ann Arbor area + national for online programs.
"""

# Primary local service area
LOCAL_TARGETS = {
    "city": "Ypsilanti, MI",
    "metro": "Ann Arbor, MI",
    "state": "Michigan",
    # Google Ads geo target IDs (for API use)
    "geo_target_ids": {
        "ypsilanti": 1014943,      # Ypsilanti, Michigan
        "ann_arbor": 1014944,      # Ann Arbor, Michigan
        "washtenaw": 1014817,      # Washtenaw County, Michigan
        "michigan": 21138,         # Michigan (state)
    },
}

# National reach for online programs
NATIONAL_TARGETS = {
    "country": "United States",
    "geo_target_id": 2840,  # United States
}

# Campaign-to-geography mapping
CAMPAIGN_GEO_MAPPING = {
    # Local campaigns: tight geographic focus
    "local": {
        "targets": ["ypsilanti", "ann_arbor", "washtenaw"],
        "bid_modifier": 1.2,  # +20% bid for local searchers
    },
    # Online program campaigns: national reach
    "online": {
        "targets": ["united_states"],
        "bid_modifier": 1.0,
    },
    # Michigan-wide campaigns
    "state": {
        "targets": ["michigan"],
        "bid_modifier": 1.1,  # +10% for in-state
    },
}


def get_geo_targets(campaign_type: str = "online") -> dict:
    """Get geographic targeting config for a campaign type."""
    return CAMPAIGN_GEO_MAPPING.get(campaign_type, CAMPAIGN_GEO_MAPPING["online"])
