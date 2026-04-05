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

echo "→ Copiando archivos estáticos al standalone..."
rm -rf "$APP_DIR/.next/standalone/public"
cp -r "$APP_DIR/public" "$APP_DIR/.next/standalone/public"
cp -r "$APP_DIR/.next/static" "$APP_DIR/.next/standalone/.next/static"
cp "$APP_DIR/.env.production" "$APP_DIR/.next/standalone/.env.production"
cp "$APP_DIR/server-wrapper.js" "$APP_DIR/.next/standalone/server-wrapper.js"

echo "→ Reiniciando PM2..."
pm2 delete devmark-dashboard 2>/dev/null || true
pm2 start "$APP_DIR/ecosystem.config.js"
pm2 save

echo "✓ Deploy completado"
