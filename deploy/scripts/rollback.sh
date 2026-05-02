#!/bin/bash
# ============================================
# Rollback Script (chạy trên VPS)
# ============================================
# Usage: ./rollback.sh
# Rollback về image tag 'previous'
# ============================================
set -e

APP_DIR="/opt/reiseblog"
COMPOSE_FILE="$APP_DIR/docker-compose.production.yml"
ENV_FILE="$APP_DIR/.env.production"

echo "========================================"
echo " ROLLBACK - Reiseblog"
echo " Time: $(date)"
echo "========================================"

# Tìm image previous
IMAGE_REPO=$(grep '^DOCKER_IMAGE=' $ENV_FILE | cut -d= -f2 | cut -d: -f1)
PREVIOUS="${IMAGE_REPO}:previous"

# Kiểm tra image tồn tại
if ! docker image inspect $PREVIOUS >/dev/null 2>&1; then
    echo "\u274c Không tìm thấy image rollback: $PREVIOUS"
    echo "Các image hiện có:"
    docker images | grep reiseblog
    exit 1
fi

CURRENT=$(grep '^DOCKER_IMAGE=' $ENV_FILE | cut -d= -f2)
echo "Current: $CURRENT"
echo "Rolling back to: $PREVIOUS"
echo ""

read -p "Xác nhận rollback? (y/N): " confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "Hủy rollback."
    exit 0
fi

# Update env
sed -i "s|^DOCKER_IMAGE=.*|DOCKER_IMAGE=$PREVIOUS|" $ENV_FILE

# Restart
echo "Restarting with previous image..."
docker compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d --remove-orphans

# Health check
for i in $(seq 1 30); do
    if docker inspect --format='{{.State.Health.Status}}' reiseblog-app 2>/dev/null | grep -q healthy; then
        echo ""
        echo "\u2705 Rollback successful! App is healthy."
        exit 0
    fi
    sleep 2
done

echo "\u26a0\ufe0f Rollback health check timeout!"
docker logs --tail 30 reiseblog-app
exit 1
