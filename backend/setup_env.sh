#!/bin/bash
# CodeMeet 2026 - Production Environment Updater
# Usage:
#   bash setup_env.sh
# Or pass custom values:
#   bash setup_env.sh <CASHFREE_APP_ID> <CASHFREE_SECRET_KEY>

CURRENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$CURRENT_DIR"

ENV_FILE=".env"

APP_ID="${1:-}"
SECRET_KEY="${2:-}"

if [ -z "$APP_ID" ] || [ -z "$SECRET_KEY" ]; then
    echo "=================================================="
    echo "  CodeMeet 2026 - Configure Production .env     "
    echo "=================================================="
    read -rp "Enter Cashfree App ID: " APP_ID
    read -rp "Enter Cashfree Secret Key: " SECRET_KEY
fi

if [ -n "$APP_ID" ] && [ -n "$SECRET_KEY" ]; then
    # Remove old keys if they exist
    if [ -f "$ENV_FILE" ]; then
        sed -i '/CASHFREE_APP_ID/d' "$ENV_FILE" 2>/dev/null || true
        sed -i '/CASHFREE_SECRET_KEY/d' "$ENV_FILE" 2>/dev/null || true
        sed -i '/CASHFREE_ENV/d' "$ENV_FILE" 2>/dev/null || true
        sed -i '/CASHFREE_API_VERSION/d' "$ENV_FILE" 2>/dev/null || true
    else
        cp .env.example "$ENV_FILE"
        sed -i '/CASHFREE_/d' "$ENV_FILE" 2>/dev/null || true
    fi

    echo "" >> "$ENV_FILE"
    echo "# Cashfree Payment Gateway (v3) Configuration" >> "$ENV_FILE"
    echo "CASHFREE_APP_ID=$APP_ID" >> "$ENV_FILE"
    echo "CASHFREE_SECRET_KEY=$SECRET_KEY" >> "$ENV_FILE"
    echo "CASHFREE_ENV=PROD" >> "$ENV_FILE"
    echo "CASHFREE_API_VERSION=2023-08-01" >> "$ENV_FILE"

    echo "✅ .env updated successfully with Cashfree credentials!"
    echo "Restarting backend service..."
    sudo systemctl restart codemeet-backend
    sudo systemctl status codemeet-backend --no-pager
else
    echo "❌ Missing credentials. .env was not modified."
fi
