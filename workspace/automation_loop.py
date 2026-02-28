"""
SEO Content Generation Engine for The Foundation of Change
Uses Groq's Llama 3.3 70B via OpenAI-compatible API to generate articles
from the content matrix with randomly selected formatting templates.
"""

import json
import os
import random
import re
import time
from datetime import datetime
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# ─── Configuration ───────────────────────────────────────────────────────────
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MATRIX_PATH = Path(__file__).parent / "content_matrix.json"
OUTPUT_DIR = Path(__file__).parent / "seo_output"
TEMPLATE_DIR = Path(__file__).parent

TEMPLATES = [
    "data_report_template.md",
    "legal_brief_template.md",
    "methodology_guide_template.md",
]

MODEL = "llama-3.3-70b-versatile"
MAX_RETRIES = 3
RETRY_DELAY = 5  # seconds

# ─── Lazy Groq Client (only created when needed) ────────────────────────────
_client = None

def get_client():
    global _client
    if _client is None:
        if not GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY not set in .env file. Get your free key at: https://console.groq.com/keys")
        _client = OpenAI(
            api_key=GROQ_API_KEY,
            base_url="https://api.groq.com/openai/v1",
        )
    return _client


def load_matrix() -> dict:
    """Load the content matrix JSON."""
    with open(MATRIX_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def save_matrix(matrix: dict) -> None:
    """Save the updated content matrix JSON."""
    with open(MATRIX_PATH, "w", encoding="utf-8") as f:
        json.dump(matrix, f, indent=2, ensure_ascii=False)


def load_template(template_name: str) -> str:
    """Load a formatting template."""
    template_path = TEMPLATE_DIR / template_name
    with open(template_path, "r", encoding="utf-8") as f:
        return f.read()


def find_next_unwritten(matrix: dict) -> tuple[dict, dict, int, int] | None:
    """
    Find the next article with status 'unwritten'.
    Returns (pillar, article, pillar_index, article_index) or None.
    """
    for pi, pillar in enumerate(matrix["content_matrix"]["pillars"]):
        for ai, article in enumerate(pillar["articles"]):
            if article.get("status") == "unwritten":
                return pillar, article, pi, ai
    return None


def sanitize_filename(title: str) -> str:
    """Convert article title to a safe filename."""
    # Remove special characters, replace spaces with hyphens
    clean = re.sub(r"[^\w\s-]", "", title.lower())
    clean = re.sub(r"[\s_]+", "-", clean.strip())
    clean = re.sub(r"-+", "-", clean)
    return clean[:80]  # Limit length


def generate_article(article: dict, pillar: dict, template: str) -> str:
    """
    Generate an SEO article using Groq's Llama 3.3 70B model.
    """
    # Build the system prompt from the template
    system_prompt = f"""You are an expert SEO content writer for The Foundation of Change, a 501(c)(3) nonprofit organization (EIN: 33-5003265) that provides court-approved online community service programs.

Your task is to write a comprehensive, SEO-optimized article following the exact template and formatting rules provided below.

CRITICAL INSTRUCTIONS:
- Write the FULL article, not a template with placeholders
- Hit the target word count of approximately {article['estimated_word_count']} words
- Naturally incorporate the primary keyword "{article['primary_keyword']}" 5-8 times throughout
- Naturally incorporate at least 3 of these long-tail keywords: {json.dumps(article['long_tail_keywords'])}
- Write for this target audience: {pillar['target_audience']}
- The article angle/brief is: {article['article_angle']}
- Search intent: {article['search_intent']}
- Funnel stage: {article['funnel_stage']}
- Subtly position The Foundation of Change as a trusted resource (not a hard sell)
- Include a natural mention of thefoundationofchange.org where relevant
- All facts and statistics should be plausible and well-reasoned (cite real studies where possible)

TEMPLATE AND FORMATTING RULES:
{template}
"""

    user_prompt = f"""Write the complete article with this title: "{article['title']}"

Article Brief: {article['article_angle']}

Primary SEO Keyword: {article['primary_keyword']}

Long-tail Keywords to Include:
{chr(10).join(f'- {kw}' for kw in article['long_tail_keywords'])}

Target Audience: {pillar['target_audience']}

Pillar Topic: {pillar['pillar_name']}

Target Word Count: {article['estimated_word_count']} words

Write the COMPLETE article now. Do NOT leave any placeholders or template markers — fill in ALL content with real, researched, authoritative information."""

    for attempt in range(MAX_RETRIES):
        try:
            response = get_client().chat.completions.create(
                model=MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.7,
                max_tokens=8000,
                top_p=0.9,
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"  ⚠️  Attempt {attempt + 1}/{MAX_RETRIES} failed: {e}")
            if attempt < MAX_RETRIES - 1:
                print(f"  ⏳ Retrying in {RETRY_DELAY}s...")
                time.sleep(RETRY_DELAY)
            else:
                raise


def run_single():
    """Generate a single article (the next unwritten one)."""
    # Validate API key
    if not GROQ_API_KEY:
        print("❌ ERROR: GROQ_API_KEY not set in .env file")
        print("   Get your free key at: https://console.groq.com/keys")
        return False

    # Load matrix
    matrix = load_matrix()
    result = find_next_unwritten(matrix)

    if result is None:
        print("✅ All articles have been written!")
        return False

    pillar, article, pi, ai = result
    print(f"\n{'='*70}")
    print(f"📝 Generating Article: {article['title']}")
    print(f"   Pillar: {pillar['pillar_name']}")
    print(f"   ID: {article['id']}")
    print(f"   Keyword: {article['primary_keyword']}")
    print(f"   Target Words: {article['estimated_word_count']}")

    # Select random template
    template_name = random.choice(TEMPLATES)
    template = load_template(template_name)
    print(f"   Template: {template_name}")

    # Generate
    print(f"   🤖 Generating with {MODEL}...")
    start_time = time.time()
    content = generate_article(article, pillar, template)
    elapsed = time.time() - start_time
    print(f"   ⏱️  Generated in {elapsed:.1f}s")

    # Count words
    word_count = len(content.split())
    print(f"   📊 Word count: {word_count}")

    # Save output
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"{article['id']}_{sanitize_filename(article['title'])}.md"
    output_path = OUTPUT_DIR / filename

    with open(output_path, "w", encoding="utf-8") as f:
        # Add front matter
        f.write(f"---\n")
        f.write(f"id: {article['id']}\n")
        f.write(f"title: \"{article['title']}\"\n")
        f.write(f"primary_keyword: \"{article['primary_keyword']}\"\n")
        f.write(f"pillar: \"{pillar['pillar_name']}\"\n")
        f.write(f"template_used: \"{template_name}\"\n")
        f.write(f"model: \"{MODEL}\"\n")
        f.write(f"word_count: {word_count}\n")
        f.write(f"generated_at: \"{datetime.now().isoformat()}\"\n")
        f.write(f"search_intent: \"{article['search_intent']}\"\n")
        f.write(f"funnel_stage: \"{article['funnel_stage']}\"\n")
        f.write(f"---\n\n")
        f.write(content)

    print(f"   💾 Saved: {output_path}")

    # Update matrix
    matrix["content_matrix"]["pillars"][pi]["articles"][ai]["status"] = "written"
    matrix["content_matrix"]["pillars"][pi]["articles"][ai]["output_file"] = str(filename)
    matrix["content_matrix"]["pillars"][pi]["articles"][ai]["generated_at"] = datetime.now().isoformat()
    matrix["content_matrix"]["pillars"][pi]["articles"][ai]["word_count"] = word_count
    matrix["content_matrix"]["pillars"][pi]["articles"][ai]["template_used"] = template_name
    save_matrix(matrix)
    print(f"   ✅ Matrix updated — article marked as 'written'")

    return True


def run_batch(count: int = 5):
    """Generate multiple articles in batch."""
    print(f"\n🚀 Starting batch generation of up to {count} articles...")
    generated = 0

    for i in range(count):
        print(f"\n--- Article {i + 1}/{count} ---")
        success = run_single()
        if not success:
            break
        generated += 1
        # Rate limiting — Groq has rate limits
        if i < count - 1:
            delay = 3
            print(f"   ⏳ Waiting {delay}s before next article (rate limiting)...")
            time.sleep(delay)

    print(f"\n{'='*70}")
    print(f"🏁 Batch complete! Generated {generated} articles.")

    # Show progress
    matrix = load_matrix()
    total = 0
    written = 0
    for pillar in matrix["content_matrix"]["pillars"]:
        for article in pillar["articles"]:
            total += 1
            if article.get("status") == "written":
                written += 1
    print(f"📈 Progress: {written}/{total} articles ({written/total*100:.1f}%)")


def show_status():
    """Show the current status of the content matrix."""
    matrix = load_matrix()
    print(f"\n{'='*70}")
    print(f"📊 Content Matrix Status")
    print(f"{'='*70}\n")

    total = 0
    written = 0

    for pillar in matrix["content_matrix"]["pillars"]:
        pillar_total = len(pillar["articles"])
        pillar_written = sum(1 for a in pillar["articles"] if a.get("status") == "written")
        total += pillar_total
        written += pillar_written

        bar_len = 30
        filled = int(bar_len * pillar_written / pillar_total) if pillar_total > 0 else 0
        bar = "█" * filled + "░" * (bar_len - filled)

        print(f"  Pillar {pillar['pillar_id']}: {pillar['pillar_name']}")
        print(f"  [{bar}] {pillar_written}/{pillar_total}")
        print()

    bar_len = 30
    filled = int(bar_len * written / total) if total > 0 else 0
    bar = "█" * filled + "░" * (bar_len - filled)
    print(f"  TOTAL: [{bar}] {written}/{total} ({written/total*100:.1f}%)")
    print()


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="SEO Content Generation Engine — The Foundation of Change"
    )
    parser.add_argument(
        "command",
        choices=["single", "batch", "status"],
        help="'single' = generate 1 article, 'batch' = generate multiple, 'status' = show progress",
    )
    parser.add_argument(
        "--count", "-n",
        type=int,
        default=5,
        help="Number of articles to generate in batch mode (default: 5)",
    )

    args = parser.parse_args()

    if args.command == "single":
        run_single()
    elif args.command == "batch":
        run_batch(args.count)
    elif args.command == "status":
        show_status()
