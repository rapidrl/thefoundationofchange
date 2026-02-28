"""
WordPress Auto-Publisher for The Foundation of Change
Reads generated Markdown articles and publishes them as drafts
to WordPress via the REST API on a drip-feed schedule (Tue/Thu).
"""

import json
import os
import re
import time
from datetime import datetime, timedelta
from pathlib import Path
import markdown
import requests
from dotenv import load_dotenv

load_dotenv()

# ─── Configuration ───────────────────────────────────────────────────────────
WP_USERNAME = os.getenv("WP_USERNAME")
WP_APP_PASSWORD = os.getenv("WP_APP_PASSWORD")
WP_BASE_URL = "https://y8e.62b.myftpupload.com/wp-json/wp/v2"

OUTPUT_DIR = Path(__file__).parent / "seo_output"
MATRIX_PATH = Path(__file__).parent / "content_matrix.json"
PUBLISH_LOG = Path(__file__).parent / "publish_log.json"

# Category slug → will be resolved to ID on first run
TARGET_CATEGORY = "Legal Resources"

# Schedule: Tuesday (1) and Thursday (3)
PUBLISH_DAYS = [1, 3]  # 0=Monday, 1=Tuesday, ... 3=Thursday
PUBLISH_TIME_HOUR = 9  # 9:00 AM EST
PUBLISH_TIME_MINUTE = 0


def load_matrix() -> dict:
    """Load the content matrix."""
    with open(MATRIX_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def save_matrix(matrix: dict) -> None:
    """Save the updated content matrix."""
    with open(MATRIX_PATH, "w", encoding="utf-8") as f:
        json.dump(matrix, f, indent=2, ensure_ascii=False)


def load_publish_log() -> list:
    """Load the publish log."""
    if PUBLISH_LOG.exists():
        with open(PUBLISH_LOG, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def save_publish_log(log: list) -> None:
    """Save the publish log."""
    with open(PUBLISH_LOG, "w", encoding="utf-8") as f:
        json.dump(log, f, indent=2, ensure_ascii=False)


def parse_front_matter(content: str) -> tuple[dict, str]:
    """
    Parse YAML front matter from markdown content.
    Returns (metadata_dict, body_content).
    """
    if content.startswith("---"):
        parts = content.split("---", 2)
        if len(parts) >= 3:
            meta_raw = parts[1].strip()
            body = parts[2].strip()
            metadata = {}
            for line in meta_raw.split("\n"):
                if ":" in line:
                    key, val = line.split(":", 1)
                    val = val.strip().strip('"').strip("'")
                    metadata[key.strip()] = val
            return metadata, body
    return {}, content


def markdown_to_html(md_content: str) -> str:
    """
    Convert Markdown to clean HTML suitable for WordPress Gutenberg editor.
    """
    # Convert markdown to HTML
    html = markdown.markdown(
        md_content,
        extensions=[
            "markdown.extensions.tables",
            "markdown.extensions.fenced_code",
            "markdown.extensions.nl2br",
            "markdown.extensions.sane_lists",
            "markdown.extensions.smarty",
        ],
    )

    # Wrap tables in responsive div for WordPress
    html = html.replace("<table>", '<div class="wp-block-table"><table>')
    html = html.replace("</table>", "</table></div>")

    # Convert blockquotes with emoji callouts to WordPress notice blocks
    # This keeps them as blockquotes but adds a class for styling
    html = re.sub(
        r"<blockquote>\s*<p>(📊|📈|🏛️|💡|⚠️)",
        r'<blockquote class="wp-block-quote has-medium-font-size"><p>\1',
        html,
    )

    return html


def get_or_create_category(category_name: str) -> int | None:
    """
    Get the WordPress category ID by name, or create it if it doesn't exist.
    """
    # Search for existing category
    response = requests.get(
        f"{WP_BASE_URL}/categories",
        params={"search": category_name, "per_page": 100},
        auth=(WP_USERNAME, WP_APP_PASSWORD),
    )

    if response.status_code == 200:
        categories = response.json()
        for cat in categories:
            if cat["name"].lower() == category_name.lower():
                print(f"   📂 Found category '{category_name}' (ID: {cat['id']})")
                return cat["id"]

    # Create the category if not found
    print(f"   📂 Creating category '{category_name}'...")
    response = requests.post(
        f"{WP_BASE_URL}/categories",
        json={"name": category_name},
        auth=(WP_USERNAME, WP_APP_PASSWORD),
    )

    if response.status_code == 201:
        cat_id = response.json()["id"]
        print(f"   ✅ Created category (ID: {cat_id})")
        return cat_id

    print(f"   ❌ Failed to create category: {response.status_code} — {response.text}")
    return None


def get_next_publish_dates(count: int = 5) -> list[datetime]:
    """
    Calculate the next N publish dates based on the Tue/Thu schedule.
    """
    dates = []
    current = datetime.now()

    while len(dates) < count:
        if current.weekday() in PUBLISH_DAYS:
            publish_dt = current.replace(
                hour=PUBLISH_TIME_HOUR,
                minute=PUBLISH_TIME_MINUTE,
                second=0,
                microsecond=0,
            )
            if publish_dt > datetime.now():
                dates.append(publish_dt)
        current += timedelta(days=1)

    return dates


def publish_article(filepath: Path, category_id: int, schedule_date: datetime = None) -> dict | None:
    """
    Publish a single article to WordPress as a draft (or scheduled).
    """
    with open(filepath, "r", encoding="utf-8") as f:
        raw_content = f.read()

    metadata, body = parse_front_matter(raw_content)
    title = metadata.get("title", filepath.stem.replace("-", " ").title())
    html_content = markdown_to_html(body)

    # Build SEO excerpt from first paragraph
    first_para = ""
    for line in body.split("\n"):
        line = line.strip()
        if line and not line.startswith("#") and not line.startswith("*") and not line.startswith(">") and not line.startswith("---"):
            first_para = line[:300]
            break

    # Clean excerpt of markdown formatting
    excerpt = re.sub(r"\*\*(.+?)\*\*", r"\1", first_para)
    excerpt = re.sub(r"\[(.+?)\]\(.+?\)", r"\1", excerpt)

    # Build post data
    post_data = {
        "title": title,
        "content": html_content,
        "excerpt": excerpt,
        "status": "draft",
        "categories": [category_id],
        "meta": {
            "article_id": metadata.get("id", ""),
            "primary_keyword": metadata.get("primary_keyword", ""),
            "pillar": metadata.get("pillar", ""),
        },
    }

    # Schedule if date provided
    if schedule_date:
        post_data["status"] = "future"
        post_data["date"] = schedule_date.isoformat()

    # POST to WordPress
    response = requests.post(
        f"{WP_BASE_URL}/posts",
        json=post_data,
        auth=(WP_USERNAME, WP_APP_PASSWORD),
    )

    if response.status_code in (200, 201):
        post = response.json()
        return {
            "wp_post_id": post["id"],
            "title": title,
            "status": post["status"],
            "link": post.get("link", ""),
            "date": post.get("date", ""),
            "file": str(filepath.name),
            "article_id": metadata.get("id", ""),
            "published_at": datetime.now().isoformat(),
        }

    print(f"   ❌ Failed: {response.status_code} — {response.text[:200]}")
    return None


def publish_single():
    """Publish the next unpublished article as a draft."""
    if not WP_USERNAME or not WP_APP_PASSWORD:
        print("❌ ERROR: WP_USERNAME and WP_APP_PASSWORD must be set in .env")
        return

    # Find written but unpublished articles
    matrix = load_matrix()
    log = load_publish_log()
    published_files = {entry["file"] for entry in log}

    # Get category ID
    category_id = get_or_create_category(TARGET_CATEGORY)
    if not category_id:
        print("❌ Could not resolve category. Aborting.")
        return

    # Find next file to publish
    for pillar in matrix["content_matrix"]["pillars"]:
        for article in pillar["articles"]:
            if article.get("status") == "written" and article.get("output_file"):
                filepath = OUTPUT_DIR / article["output_file"]
                if filepath.name not in published_files and filepath.exists():
                    print(f"\n📤 Publishing: {article['title']}")
                    print(f"   File: {filepath.name}")

                    result = publish_article(filepath, category_id)
                    if result:
                        log.append(result)
                        save_publish_log(log)
                        article["wp_status"] = "draft"
                        article["wp_post_id"] = result["wp_post_id"]
                        save_matrix(matrix)
                        print(f"   ✅ Published as DRAFT (Post ID: {result['wp_post_id']})")
                        print(f"   🔗 {result.get('link', 'N/A')}")
                    return

    print("✅ No unpublished articles found. Generate more with automation_loop.py!")


def publish_scheduled_batch():
    """
    Publish multiple articles with scheduled dates (Tue/Thu drip-feed).
    """
    if not WP_USERNAME or not WP_APP_PASSWORD:
        print("❌ ERROR: WP_USERNAME and WP_APP_PASSWORD must be set in .env")
        return

    matrix = load_matrix()
    log = load_publish_log()
    published_files = {entry["file"] for entry in log}

    category_id = get_or_create_category(TARGET_CATEGORY)
    if not category_id:
        return

    # Collect unpublished files
    to_publish = []
    for pillar in matrix["content_matrix"]["pillars"]:
        for article in pillar["articles"]:
            if article.get("status") == "written" and article.get("output_file"):
                filepath = OUTPUT_DIR / article["output_file"]
                if filepath.name not in published_files and filepath.exists():
                    to_publish.append((article, filepath))

    if not to_publish:
        print("✅ No articles to publish!")
        return

    # Calculate schedule dates
    dates = get_next_publish_dates(len(to_publish))

    print(f"\n🗓️  Scheduling {len(to_publish)} articles for drip-feed publishing...")
    print(f"   Schedule: Every Tuesday and Thursday at {PUBLISH_TIME_HOUR}:00 AM\n")

    for (article, filepath), schedule_date in zip(to_publish, dates):
        print(f"📤 Scheduling: {article['title']}")
        print(f"   📅 Date: {schedule_date.strftime('%A, %B %d, %Y at %I:%M %p')}")

        result = publish_article(filepath, category_id, schedule_date)
        if result:
            log.append(result)
            save_publish_log(log)
            article["wp_status"] = "scheduled"
            article["wp_post_id"] = result["wp_post_id"]
            article["scheduled_date"] = schedule_date.isoformat()
            save_matrix(matrix)
            print(f"   ✅ Scheduled (Post ID: {result['wp_post_id']})")
        print()

        time.sleep(1)  # Be gentle on the API

    save_matrix(matrix)
    print(f"\n🏁 Done! {len(to_publish)} articles scheduled for drip-feed publishing.")


def show_schedule():
    """Show the current publish schedule and log."""
    log = load_publish_log()

    print(f"\n{'='*70}")
    print(f"📊 Publishing Status")
    print(f"{'='*70}\n")

    if not log:
        print("  No articles published yet.\n")
    else:
        for entry in log:
            status_icon = "✅" if entry.get("status") == "publish" else "📋" if entry.get("status") == "draft" else "🗓️"
            print(f"  {status_icon} [{entry.get('article_id', '?')}] {entry['title']}")
            print(f"     Status: {entry.get('status', 'unknown')} | Post ID: {entry.get('wp_post_id', '?')}")
            if entry.get("date"):
                print(f"     Date: {entry['date']}")
            print()

    # Show upcoming schedule
    print(f"\n📅 Next 10 Publish Slots:")
    for date in get_next_publish_dates(10):
        print(f"   {date.strftime('%A, %B %d, %Y at %I:%M %p')}")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="WordPress Publisher — The Foundation of Change SEO Pipeline"
    )
    parser.add_argument(
        "command",
        choices=["single", "schedule", "status"],
        help=(
            "'single' = publish next article as draft, "
            "'schedule' = schedule all unpublished on Tue/Thu drip, "
            "'status' = show publish log and schedule"
        ),
    )

    args = parser.parse_args()

    if args.command == "single":
        publish_single()
    elif args.command == "schedule":
        publish_scheduled_batch()
    elif args.command == "status":
        show_schedule()
