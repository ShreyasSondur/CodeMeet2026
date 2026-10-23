#!/bin/bash
set -e

# CodeMeet 2026 - Root Deployment & Migration Wrapper
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "=================================================="
echo "  CODEMEET 2026 - REPOSITORY DEPLOYMENT RUNNER    "
echo "  Root: $ROOT_DIR"
echo "=================================================="

# 1. Pull latest changes if inside git repo
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "[1/2] Pulling latest git updates on main..."
    git fetch origin main || true
    git pull origin main || true
fi

# 2. Execute backend update and safe database migration
echo "[2/2] Triggering backend deployment & database migration..."
if [ -f "backend/update_vps.sh" ]; then
    bash backend/update_vps.sh
elif [ -f "update_vps.sh" ]; then
    bash update_vps.sh
else
    echo "❌ Could not locate update_vps.sh"
    exit 1
fi
