# FOC Ads Agent — Design Documentation
## Google Ads API Tool for The Foundation of Change

### 1. Overview

**Tool Name:** FOC Ads Agent  
**Organization:** The Foundation of Change (501(c)(3) Nonprofit)  
**Website:** https://thefoundationofchange.org  
**Purpose:** Internal read-only analytics and reporting tool for Google Ads campaigns  
**MCC Account ID:** 703-949-8158  

### 2. Tool Description

FOC Ads Agent is an internal Python-based tool designed to provide automated analytics and reporting for The Foundation of Change's Google Ads campaigns. The tool operates in **read-only mode** — it gathers data, analyzes performance, and generates recommendations. **It does not make any changes to the Google Ads account.**

### 3. Features

#### Data Gathering (Read-Only)
- **Search Term Analysis:** Queries SearchTermView to identify which search terms trigger ads
- **Performance Metrics:** Fetches campaign, ad group, and keyword performance data
- **Budget Monitoring:** Tracks daily and monthly spend against budget limits

#### Recommendations (No Mutations)
- **Negative Keywords:** Identifies search terms wasting budget (high clicks, zero conversions)
- **Keyword Expansion:** Finds converting search terms not yet added as keywords
- **Bid Optimization:** Recommends bid adjustments based on CPA targets
- **Ad Copy Testing:** Compares ad variant performance within ad groups

#### Reporting
- **Daily Summary:** Key metrics overview sent via console/Slack/Telegram
- **Weekly Deep Dive:** Comprehensive 9-section analysis with trends
- **Real-time Alerts:** CPA spikes, budget exhaustion, disapproved ads, Ad Grants CTR

### 4. API Usage

#### Endpoints Used
The tool exclusively uses the **GoogleAdsService.Search** endpoint for data retrieval:

- `campaign` resource — Campaign name, budget, status, serving status
- `ad_group` resource — Ad group names and metrics
- `ad_group_ad` resource — Ad performance, headlines, policy status
- `keyword_view` resource — Keyword performance, bids, match type
- `search_term_view` resource — Search query reports

#### GAQL Queries
All queries are SELECT-only. Example:
```sql
SELECT 
    segments.search_term, segments.date,
    metrics.clicks, metrics.impressions, metrics.cost_micros,
    metrics.conversions, metrics.ctr
FROM search_term_view
WHERE segments.date DURING LAST_30_DAYS
```

#### No Mutate Operations
The tool does NOT use any mutate endpoints. It cannot:
- Create, modify, or delete campaigns
- Create, modify, or delete ad groups
- Create, modify, or delete keywords
- Pause or enable any entities
- Modify budgets or bids

### 5. Architecture

```
Docker Container (foc-ads-agent)
├── main.py (scheduler)
├── google_ads_client.py (auth + read-only queries)
├── skills/data_gathering/ (search terms, performance, budget)
├── skills/actions/ (recommendations only, no mutations)
├── skills/reporting/ (daily, weekly, alerts)
└── db/ (SQLite local log)
```

### 6. Security & Compliance

- **Read-only access only** — no mutations to Google Ads accounts
- Credentials stored in environment variables (never in code)
- Docker container runs in isolated environment
- All data stays local (SQLite database)
- Compliant with Google Ad Grants rules ($2 CPC cap, 5% CTR monitoring)

### 7. Users

The tool is used internally by The Foundation of Change staff to monitor and optimize their nonprofit advertising campaigns. It is not distributed to external users.

### 8. Contact

**API Contact:** info@thefoundationofchange.org  
**Website:** https://thefoundationofchange.org  
