#!/bin/bash
# ============================================
# Manual Deploy Script (chạy trên VPS)
# ============================================
# Usage: ./deploy.sh [image_tag]
# Example: ./deploy.sh abc1234
# ============================================
set -e

APP_DIR="/opt/reiseblog"
COMPOSE_FILE="$APP_DIR/docker-compose.production.yml"
ENV_FILE="$APP_DIR/.env.production"
REGISTRY="ghcr.io"

# Load env
source $ENV_FILE 2>/dev/null || true

# Default image
IMAGE_TAG=${1:-latest}
IMAGE_REPO=$(grep '^DOCKER_IMAGE=' $ENV_FILE | cut -d= -f2 | cut -d: -f1)
IMAGE="${IMAGE_REPO}:${IMAGE_TAG}"

echo "========================================"
echo " Manual Deploy - Reiseblog"
echo " Image: $IMAGE"
echo " Time: $(date)"
echo "========================================"

# Pull
echo "[1/4] Pulling image..."
docker pull $IMAGE

# Backup current
CURRENT=$(docker inspect --format='{{.Config.Image}}' reiseblog-app 2>/dev/null || echo "none")
if [ "$CURRENT" != "none" ] && [ "$CURRENT" != "$IMAGE" ]; then
    echo "[2/4] Saving rollback tag..."
    docker tag $CURRENT ${IMAGE_REPO}:previous 2>/dev/null || true
fi

# Update env
sed -i "s|^DOCKER_IMAGE=.*|DOCKER_IMAGE=$IMAGE|" $ENV_FILE

# Deploy
echo "[3/4] Starting containers..."
docker compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d --remove-orphans

# Health check
echo "[4/4] Health check..."
for i in $(seq 1 30); do
    if docker inspect --format='{{.State.Health.Status}}' reiseblog-app 2>/dev/null | grep -q healthy; then
        echo ""
        echo "\u2705 Deploy successful! App is healthy."
        exit 0
    fi
    echo -n "."
    sleep 2
done

echo ""
echo "\u26a0\ufe0f Health check timeout!"
docker logs --tail 30 reiseblog-app
exit 1
