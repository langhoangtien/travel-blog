#!/bin/sh
set -e

echo "========================================"
echo " Reiseblog - Production Entrypoint"
echo "========================================"
echo "Environment: ${NODE_ENV}"
echo "Port: ${PORT}"
echo "Time: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"

# --- Run Prisma Migrations ---
if [ "${RUN_MIGRATIONS}" = "true" ]; then
    echo ""
    echo "[Migration] Running prisma migrate deploy..."
    npx prisma migrate deploy --schema=./prisma/schema.prisma
    echo "[Migration] Done."
fi

echo ""
echo "[App] Starting Next.js server..."
exec "$@"
