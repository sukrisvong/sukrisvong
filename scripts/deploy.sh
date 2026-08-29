#!/usr/bin/env bash
# Deploy latest main to the server. Run from /app on the droplet.
set -euo pipefail

cd /app

git pull origin main

docker compose -f docker-compose.yml -f docker-compose.prod.yml pull --ignore-buildable
docker compose -f docker-compose.yml -f docker-compose.prod.yml build
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --remove-orphans

# Run migrations
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec backend \
  bundle exec rails db:migrate

echo "Deployed successfully."
