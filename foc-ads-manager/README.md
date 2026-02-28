# FOC Google Ads Agent

Automated Google Ads management agent for **The Foundation of Change** — a nonprofit community service program.

## What It Does

- **Gathers data** from your Google Ads campaigns (search terms, keywords, performance, budgets)
- **Optimizes** bids, keywords, and negatives based on CPA targets
- **Reports** daily summaries and weekly deep-dive analyses
- **Protects** your budget with spend caps, approval gates, and rollback capability
- **Complies** with Google Ad Grants rules (if enabled)

## Quick Start

```bash
# 1. Install dependencies
cd foc-ads-manager
pip install -r requirements.txt

# 2. Set up credentials
#    Fill in your Google Ads API credentials in .env
#    See .env.example for all required variables

# 3. Generate refresh token (one-time)
python get_refresh_token.py

# 4. Run the agent
python main.py                 # Single optimization cycle
python main.py --status        # View account status
python main.py --report daily  # Generate daily report
python main.py --report weekly # Generate weekly report
python main.py --alerts        # Check alerts
python main.py --schedule      # Run on schedule (daily/weekly)
python main.py --rollback 42   # Roll back action #42
```

## Prerequisites

1. **Google Ads account** (you have this: AW-17595795029)
2. **Manager Account (MCC)** with Developer Token — [Apply here](https://ads.google.com/home/tools/manager-accounts/)
3. **Google Cloud project** with OAuth 2.0 credentials — [Console](https://console.cloud.google.com)
4. **Refresh token** — Run `python get_refresh_token.py`

## Safety

- All actions are logged to SQLite (`db/action_log.db`)
- Major changes require your approval (pause campaigns, high bids, budget changes)
- Hard daily spend cap prevents overspending
- Any action can be rolled back: `python main.py --rollback <ID>`

## Ad Grants

Set `AD_GRANTS_MODE=true` in `.env` to enable:
- $2.00 max CPC enforcement
- 5% minimum CTR monitoring
- Single-word keyword blocking
- Automatic CTR compliance alerts
