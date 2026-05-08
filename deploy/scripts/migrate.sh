#!/bin/bash
# ============================================
# Manual Migration Script (chạy trên VPS)
# ============================================
# Usage: ./migrate.sh
# ============================================
set -e

APP_DIR="/opt/nerovia"
COMPOSE_FILE="$APP_DIR/docker-compose.production.yml"
ENV_FILE="$APP_DIR/.env.production"

echo "========================================"
echo " Database Migration - Nerovia"
echo "========================================"

echo "Running prisma migrate deploy..."
docker compose -f $COMPOSE_FILE --env-file $ENV_FILE run --rm \
    -e RUN_MIGRATIONS=true \
    app npx prisma migrate deploy --schema=./prisma/schema.prisma

echo ""
echo "\u2705 Migration complete!"

# Restart app to pick up schema changes
echo "Restarting app..."
docker compose -f $COMPOSE_FILE --env-file $ENV_FILE restart app

echo "\u2705 Done!"
