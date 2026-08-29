#!/usr/bin/env bash
# Run once on a fresh Ubuntu 24.04 DigitalOcean droplet as root.
set -euo pipefail

# Docker
apt-get update -qq
apt-get install -y ca-certificates curl gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  > /etc/apt/sources.list.d/docker.list
apt-get update -qq
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Clone repo
git clone https://github.com/sukrisvong/sukrisvong.git /app
cd /app

# Copy and fill in your secrets before running deploy
cp .env.production.example .env
echo ""
echo "Server setup complete."
echo "Next: edit /app/.env with real secrets, then run scripts/deploy.sh"
