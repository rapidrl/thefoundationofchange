"""
Negative Keyword Seed List for Foundation of Change
Pre-built list of irrelevant terms to exclude from the start.
"""

# Terms that attract irrelevant clicks for a community service nonprofit
NEGATIVE_SEED_LIST = [
    # Employment / jobs (not volunteering)
    "paid jobs",
    "salary",
    "employment",
    "hiring",
    "job openings",
    "careers",
    "work from home jobs",
    "remote jobs",
    "part time job",
    "full time job",
    "internship pay",
    "paid internship",
    "wages",
    "hourly pay",
    "minimum wage",

    # Criminal / legal (wrong type of court search)
    "attorney",
    "lawyer",
    "law firm",
    "bail bonds",
    "criminal defense",
    "felony charges",
    "jail time",
    "prison",
    "inmate",

    # Government services (not what we offer)
    "social security",
    "food stamps",
    "welfare",
    "unemployment benefits",
    "disability",
    "medicaid",
    "government assistance",
    "section 8",
    "housing assistance",

    # Education (wrong context)
    "community college",
    "community college courses",
    "GED",
    "school enrollment",
    "tuition",
    "financial aid",
    "FAFSA",

    # Unrelated services
    "community center hours",
    "pool hours",
    "gym hours",
    "library hours",
    "dmv hours",
    "post office hours",
    "bank hours",

    # Scam / free stuff seekers
    "free money",
    "free stuff",
    "giveaway",
    "sweepstakes",

    # Other nonprofits / competitors
    "red cross volunteer",
    "habitat for humanity",
    "peace corps",
    "americorps",

    # Location-irrelevant (add more as needed)
    "near me",  # Can be useful but often too broad
]

# Negative keywords organized by campaign type for granular exclusion
CAMPAIGN_NEGATIVES = {
    "online_program": [
        "in person",
        "physical location",
        "walk in",
        "local only",
    ],
    "local_program": [
        "online only",
        "remote only",
        "virtual only",
    ],
}


def get_all_negatives() -> list[str]:
    """Return the complete negative keyword seed list."""
    return NEGATIVE_SEED_LIST


def get_campaign_negatives(campaign_type: str) -> list[str]:
    """Return campaign-specific negatives."""
    return CAMPAIGN_NEGATIVES.get(campaign_type, [])
