"""Wait for Groq rate limit reset, then generate and publish articles."""
import time
import subprocess
import sys

WAIT_MINUTES = 18
BATCH_SIZE = 20

print(f"Waiting {WAIT_MINUTES} minutes for Groq rate limit reset...")
for i in range(WAIT_MINUTES, 0, -1):
    print(f"  {i} minutes remaining...", end="\r")
    time.sleep(60)
print("Rate limit should be reset! Starting generation...\n")

# Generate
result = subprocess.run(
    [sys.executable, "automation_loop.py", "batch", "--count", str(BATCH_SIZE)],
    cwd=".",
    env={**__import__("os").environ, "PYTHONIOENCODING": "utf-8"},
)

if result.returncode == 0:
    print("\nPublishing to WordPress...")
    subprocess.run(
        [sys.executable, "batch_publish.py"],
        cwd=".",
        env={**__import__("os").environ, "PYTHONIOENCODING": "utf-8"},
    )

# Show status
subprocess.run(
    [sys.executable, "automation_loop.py", "status"],
    cwd=".",
    env={**__import__("os").environ, "PYTHONIOENCODING": "utf-8"},
)
