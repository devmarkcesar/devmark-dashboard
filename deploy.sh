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
cp -r "$APP_DIR/public" "$APP_DIR/.next/standalone/public"
cp -r "$APP_DIR/.next/static" "$APP_DIR/.next/standalone/.next/static"

echo "→ Reiniciando PM2..."
pm2 restart devmark-dashboard

echo "✓ Deploy completado"
