"""
Search Terms & Keywords Skill
Pull search query performance data, identify opportunities and waste.
"""

from __future__ import annotations
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from google_ads_client import get_client, get_customer_id, run_query, get_env_int


# ─── GAQL Queries ────────────────────────────────────────────

SEARCH_TERM_QUERY = """
    SELECT
        search_term_view.search_term,
        search_term_view.status,
        campaign.name,
        ad_group.name,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.average_cpc,
        metrics.conversions,
        metrics.cost_per_conversion,
        metrics.cost_micros
    FROM search_term_view
    WHERE segments.date DURING LAST_30_DAYS
        AND metrics.impressions > 0
    ORDER BY metrics.impressions DESC
    LIMIT 500
"""

KEYWORD_QUERY = """
    SELECT
        ad_group_criterion.keyword.text,
        ad_group_criterion.keyword.match_type,
        ad_group_criterion.quality_info.quality_score,
        ad_group_criterion.status,
        ad_group_criterion.effective_cpc_bid_micros,
        campaign.name,
        ad_group.name,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.average_cpc,
        metrics.conversions,
        metrics.cost_per_conversion,
        metrics.cost_micros
    FROM keyword_view
    WHERE segments.date DURING LAST_30_DAYS
        AND ad_group_criterion.status != 'REMOVED'
    ORDER BY metrics.impressions DESC
    LIMIT 500
"""


# ─── Data Extraction ────────────────────────────────────────

def get_search_terms(days: str = "LAST_30_DAYS") -> list[dict]:
    """
    Pull search term performance report.
    Returns list of dicts with search term, campaign, ad group, and metrics.
    """
    client = get_client()
    customer_id = get_customer_id()

    query = SEARCH_TERM_QUERY.replace("LAST_30_DAYS", days) if days != "LAST_30_DAYS" else SEARCH_TERM_QUERY
    rows = run_query(client, customer_id, query)

    results = []
    for row in rows:
        results.append({
            "search_term": row.search_term_view.search_term,
            "status": row.search_term_view.status.name,
            "campaign": row.campaign.name,
            "ad_group": row.ad_group.name,
            "impressions": row.metrics.impressions,
            "clicks": row.metrics.clicks,
            "ctr": round(row.metrics.ctr * 100, 2),
            "avg_cpc": row.metrics.average_cpc / 1_000_000,
            "conversions": row.metrics.conversions,
            "cost_per_conversion": row.metrics.cost_per_conversion / 1_000_000 if row.metrics.cost_per_conversion else 0,
            "cost": row.metrics.cost_micros / 1_000_000,
        })
    return results


def get_keywords() -> list[dict]:
    """
    Pull keyword-level performance data.
    Returns list of dicts with keyword text, match type, quality score, and metrics.
    """
    client = get_client()
    customer_id = get_customer_id()
    rows = run_query(client, customer_id, KEYWORD_QUERY)

    results = []
    for row in rows:
        quality_score = row.ad_group_criterion.quality_info.quality_score
        results.append({
            "keyword": row.ad_group_criterion.keyword.text,
            "match_type": row.ad_group_criterion.keyword.match_type.name,
            "quality_score": quality_score if quality_score else None,
            "status": row.ad_group_criterion.status.name,
            "bid_micros": row.ad_group_criterion.effective_cpc_bid_micros,
            "bid": row.ad_group_criterion.effective_cpc_bid_micros / 1_000_000,
            "campaign": row.campaign.name,
            "ad_group": row.ad_group.name,
            "impressions": row.metrics.impressions,
            "clicks": row.metrics.clicks,
            "ctr": round(row.metrics.ctr * 100, 2),
            "avg_cpc": row.metrics.average_cpc / 1_000_000,
            "conversions": row.metrics.conversions,
            "cost_per_conversion": row.metrics.cost_per_conversion / 1_000_000 if row.metrics.cost_per_conversion else 0,
            "cost": row.metrics.cost_micros / 1_000_000,
        })
    return results


# ─── Analysis ────────────────────────────────────────────────

def find_negative_candidates(search_terms: list[dict] | None = None) -> list[dict]:
    """
    Identify search terms that are wasting budget.
    Rule: 50+ clicks with 0 conversions → candidate for negative keyword.
    """
    if search_terms is None:
        search_terms = get_search_terms()

    min_clicks = get_env_int("MIN_CLICKS_FOR_NEGATIVE", 50)
    candidates = []
    for term in search_terms:
        if term["clicks"] >= min_clicks and term["conversions"] == 0:
            candidates.append({
                **term,
                "reason": f"{term['clicks']} clicks, 0 conversions, ${term['cost']:.2f} wasted",
            })
    return sorted(candidates, key=lambda x: x["cost"], reverse=True)


def find_expansion_candidates(search_terms: list[dict] | None = None, keywords: list[dict] | None = None) -> list[dict]:
    """
    Find converting search terms not already added as exact/phrase match keywords.
    """
    if search_terms is None:
        search_terms = get_search_terms()
    if keywords is None:
        keywords = get_keywords()

    # Build set of existing keyword texts (lowered)
    existing = {kw["keyword"].lower() for kw in keywords}

    candidates = []
    for term in search_terms:
        if term["conversions"] > 0 and term["search_term"].lower() not in existing:
            candidates.append({
                **term,
                "suggested_bid": round(term["avg_cpc"], 2),
                "reason": f"{term['conversions']:.0f} conversions at ${term['cost_per_conversion']:.2f} CPA — not yet a keyword",
            })
    return sorted(candidates, key=lambda x: x["conversions"], reverse=True)


# ─── CLI ─────────────────────────────────────────────────────

if __name__ == "__main__":
    from tabulate import tabulate

    print("\n═══ SEARCH TERM REPORT ═══")
    terms = get_search_terms()
    if terms:
        print(tabulate(terms[:20], headers="keys", floatfmt=".2f"))

    print("\n═══ NEGATIVE KEYWORD CANDIDATES ═══")
    negatives = find_negative_candidates(terms)
    if negatives:
        print(tabulate(negatives[:10], headers="keys", floatfmt=".2f"))
    else:
        print("  No candidates found (threshold: 50 clicks, 0 conversions)")

    print("\n═══ KEYWORD EXPANSION CANDIDATES ═══")
    keywords = get_keywords()
    expansions = find_expansion_candidates(terms, keywords)
    if expansions:
        print(tabulate(expansions[:10], headers="keys", floatfmt=".2f"))
    else:
        print("  No expansion candidates found")
