FROM python:3.12-slim

LABEL maintainer="The Foundation of Change <info@thefoundationofchange.org>"
LABEL description="FOC Google Ads Agent — Read-only analysis and recommendations"

WORKDIR /app/foc-ads-manager

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all source
COPY . .

# Environment defaults (override with docker run --env-file .env)
ENV PYTHONUNBUFFERED=1
ENV NOTIFICATION_CHANNEL=console

# Default: run the analysis cycle
CMD ["python", "main.py", "--schedule"]
