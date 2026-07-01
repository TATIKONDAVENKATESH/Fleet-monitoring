#!/usr/bin/env bash
# ============================================================
set -euo pipefail

cd "$(dirname "$0")/.."   # always run from repo root, regardless of cwd

STATE_DIR=".deploy"
STATE_FILE="${STATE_DIR}/last_good.env"
mkdir -p "$STATE_DIR"

HEALTH_URL="http://localhost/actuator/health"
FRONTEND_URL="http://localhost/"
HEALTH_TIMEOUT_SECONDS=240
HEALTH_POLL_INTERVAL=3

log() { echo "[deploy] $(date '+%H:%M:%S') $*"; }

TAG="$(git rev-parse --short HEAD 2>/dev/null || date +%Y%m%d%H%M%S)"
BACKEND_IMAGE="fleet-monitoring-backend:${TAG}"
FRONTEND_IMAGE="fleet-monitoring-frontend:${TAG}"

load_last_good() {
  LAST_GOOD_BACKEND_IMAGE=""
  LAST_GOOD_FRONTEND_IMAGE=""
  LAST_GOOD_TAG=""
  LAST_GOOD_AT=""
  if [[ -f "$STATE_FILE" ]]; then
    # shellcheck disable=SC1090
    source "$STATE_FILE"
  fi
}

save_last_good() {
  cat > "$STATE_FILE" <<EOF
LAST_GOOD_BACKEND_IMAGE=${BACKEND_IMAGE}
LAST_GOOD_FRONTEND_IMAGE=${FRONTEND_IMAGE}
LAST_GOOD_TAG=${TAG}
LAST_GOOD_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
EOF
  log "Recorded ${TAG} as last known-good deployment."
}

wait_for_health() {
  local elapsed=0
  log "Waiting for health at ${HEALTH_URL} (timeout ${HEALTH_TIMEOUT_SECONDS}s)..."
  while (( elapsed < HEALTH_TIMEOUT_SECONDS )); do
    if curl -fsS "$HEALTH_URL" 2>/dev/null | grep -q '"status":"UP"' \
       && curl -fsS -o /dev/null "$FRONTEND_URL" 2>/dev/null; then
      log "Backend and frontend are healthy."
      return 0
    fi
    sleep "$HEALTH_POLL_INTERVAL"
    elapsed=$(( elapsed + HEALTH_POLL_INTERVAL ))
  done
  return 1
}

deploy() {
  log "Building images for tag ${TAG}..."
  BACKEND_IMAGE="$BACKEND_IMAGE" FRONTEND_IMAGE="$FRONTEND_IMAGE" \
    docker compose build backend frontend

  load_last_good

  log "Starting containers (backend=${BACKEND_IMAGE}, frontend=${FRONTEND_IMAGE})..."
  BACKEND_IMAGE="$BACKEND_IMAGE" FRONTEND_IMAGE="$FRONTEND_IMAGE" \
      docker compose up -d --no-recreate postgres redis
  BACKEND_IMAGE="$BACKEND_IMAGE" FRONTEND_IMAGE="$FRONTEND_IMAGE" \
      docker compose up -d backend frontend nginx
  BACKEND_IMAGE="$BACKEND_IMAGE" FRONTEND_IMAGE="$FRONTEND_IMAGE" \
    docker compose up -d backend frontend nginx

  if wait_for_health; then
    save_last_good
    log "Deploy of ${TAG} succeeded."
    exit 0
  fi

  log "Health check FAILED for ${TAG}. Recent backend logs:"
  docker compose logs backend --tail 50 || true

  if [[ -n "$LAST_GOOD_BACKEND_IMAGE" ]]; then
    log "Rolling back to last known-good (${LAST_GOOD_TAG})..."
    BACKEND_IMAGE="$LAST_GOOD_BACKEND_IMAGE" FRONTEND_IMAGE="$LAST_GOOD_FRONTEND_IMAGE" \
      docker compose up -d backend frontend nginx

    if wait_for_health; then
      log "Rollback succeeded — public site is back on ${LAST_GOOD_TAG}."
      log "Deploy of ${TAG} was rejected and rolled back. Fix and redeploy."
      exit 1
    else
      log "ROLLBACK ALSO FAILED. Manual intervention required — check 'docker compose logs'."
      exit 2
    fi
  else
    log "No previous known-good deployment recorded — nothing to roll back to."
    log "Manual intervention required."
    exit 2
  fi
}

rollback() {
  load_last_good
  if [[ -z "$LAST_GOOD_BACKEND_IMAGE" ]]; then
    log "No recorded last known-good deployment. Nothing to roll back to."
    exit 1
  fi
  log "Manually rolling back to ${LAST_GOOD_TAG} (${LAST_GOOD_BACKEND_IMAGE})..."
  BACKEND_IMAGE="$LAST_GOOD_BACKEND_IMAGE" FRONTEND_IMAGE="$LAST_GOOD_FRONTEND_IMAGE" \
    docker compose up -d backend frontend nginx
  if wait_for_health; then
    log "Rollback successful."
  else
    log "Rollback deployed but health check is still failing — check logs."
    exit 2
  fi
}

status() {
  load_last_good
  echo "Would deploy as tag:            ${TAG}"
  echo "Last known-good backend image:  ${LAST_GOOD_BACKEND_IMAGE:-<none recorded>}"
  echo "Last known-good frontend image: ${LAST_GOOD_FRONTEND_IMAGE:-<none recorded>}"
  echo "Last known-good tag:            ${LAST_GOOD_TAG:-<none>}"
  echo "Last known-good at:             ${LAST_GOOD_AT:-<none>}"
}

case "${1:-deploy}" in
  deploy)   deploy ;;
  rollback) rollback ;;
  status)   status ;;
  *) echo "Usage: $0 [deploy|rollback|status]"; exit 1 ;;
esac