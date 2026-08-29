#!/usr/bin/env bash
# Run once on the server to obtain the initial Let's Encrypt certificate.
set -euo pipefail

source /app/.env
COMPOSE="docker compose -f /app/docker-compose.yml -f /app/docker-compose.prod.yml"

# Create volumes if they don't exist
# Use fixed names so docker-compose.prod.yml external volumes match
docker volume create sukrisvong_certbot_certs 2>/dev/null || true
docker volume create sukrisvong_certbot_webroot 2>/dev/null || true

WEBROOT=$(docker volume inspect sukrisvong_certbot_webroot --format '{{.Mountpoint}}')
sudo mkdir -p "${WEBROOT}/.well-known/acme-challenge"

# Start a temporary nginx to serve the ACME challenge on port 80
docker run -d --name nginx-bootstrap \
  -p 80:80 \
  -v "sukrisvong_certbot_webroot:/var/www/certbot" \
  nginx:alpine sh -c "
    mkdir -p /etc/nginx/conf.d
    cat > /etc/nginx/conf.d/default.conf << 'EOF'
server {
    listen 80;
    server_name _;
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / { return 200 'Bootstrapping SSL...'; }
}
EOF
    nginx -g 'daemon off;'"

sleep 2

# Obtain the certificate
docker run --rm \
  -v sukrisvong_certbot_certs:/etc/letsencrypt \
  -v sukrisvong_certbot_webroot:/var/www/certbot \
  certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "${CERTBOT_EMAIL}" \
    --agree-tos \
    --no-eff-email \
    -d "${DOMAIN}" \
    -d "www.${DOMAIN}"

# Tear down bootstrap nginx, start the real stack
docker stop nginx-bootstrap && docker rm nginx-bootstrap

$COMPOSE up -d --build

echo "Done. Your site should be live at https://${DOMAIN}"
