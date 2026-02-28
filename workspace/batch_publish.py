"""Publish all unpublished articles as WordPress drafts."""
import sys
sys.path.insert(0, '.')
from wp_publisher import publish_single

# Publish up to 15 articles
for i in range(15):
    print(f"\n--- Publishing article {i+1} ---")
    publish_single()
    print()
