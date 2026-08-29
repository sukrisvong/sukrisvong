#!/usr/bin/env bash
# Run once on the server to obtain the initial Let's Encrypt certificate.
set -euo pipefail

source /app/.env
COMPOSE="docker compose -f /app/docker-compose.yml -f /app/docker-compose.prod.yml"

# Start nginx with bootstrap (HTTP-only) config so ACME challenge works
docker run -d --name nginx-bootstrap \
  -p 80:80 \
  -v "$(docker volume inspect sukrisvong_certbot_webroot -f '{{.Mountpoint}}'):/var/www/certbot" \
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

# Get the cert
$COMPOSE run --rm certbot certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email "${CERTBOT_EMAIL}" \
  --agree-tos \
  --no-eff-email \
  -d "${DOMAIN}"

# Tear down bootstrap nginx, start the real stack
docker stop nginx-bootstrap && docker rm nginx-bootstrap
$COMPOSE up -d

echo "Done. Your site should be live at https://${DOMAIN}"
