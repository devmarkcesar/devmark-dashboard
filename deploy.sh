#!/bin/bash
set -e

APP_DIR="/var/www/devmark-dashboard"

echo "→ Actualizando código..."
cd "$APP_DIR"
git pull

echo "→ Instalando dependencias..."
npm install --include=dev

echo "→ Compilando..."
rm -rf .next
npm run build

echo "→ Actualizando nginx..."
sudo cp "$APP_DIR/deploy/nginx-devmark-app.conf" /etc/nginx/sites-available/devmark-app
sudo nginx -t && sudo systemctl reload nginx

echo "→ Reiniciando PM2..."
pm2 delete devmark-dashboard 2>/dev/null || true
pm2 start "$APP_DIR/ecosystem.config.js"
pm2 save

echo "✓ Deploy completado"
