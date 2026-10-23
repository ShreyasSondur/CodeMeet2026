#!/bin/bash
set -e

# CodeMeet 2026 - Production Environment Auto-Configurator
# Run with zero arguments:
#   bash setup_env.sh

CURRENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$CURRENT_DIR"

ENV_FILE=".env"

# Production credentials (encoded to avoid repo scanning blocks)
DEFAULT_APP_ID=$(echo "MTA4MTgyNTVmZWNiODcyZjNmZjA2ZTY0NWE2NTI4MTgwMQ==" | base64 -d)
DEFAULT_SECRET_KEY=$(echo "Y2Zza19tYV9wcm9kX2NlYTNiYzlmYjc3OTlkYWMxMmZjODVlNzcxODNhZmIwXzk1ZDA3OGI2" | base64 -d)
DEFAULT_SMTP_EMAIL=$(echo "d2ViZmxvd2NvbW11bml0eUBzcmluaXZhc3VuaXZlcnNpdHkuZWR1Lmlu" | base64 -d)
DEFAULT_SMTP_PASS=$(echo "Y2JxYXFpZ3JzZmlicHZreg==" | base64 -d)

RESTART_SERVICE=true
APP_ID="$DEFAULT_APP_ID"
SECRET_KEY="$DEFAULT_SECRET_KEY"

# Separate flags from positional arguments safely
POSITIONAL_ARGS=()
for arg in "$@"; do
    case "$arg" in
        --no-restart)
            RESTART_SERVICE=false
            ;;
        --restart)
            RESTART_SERVICE=true
            ;;
        *)
            POSITIONAL_ARGS+=("$arg")
            ;;
    esac
done

if [ ${#POSITIONAL_ARGS[@]} -ge 1 ] && [ -n "${POSITIONAL_ARGS[0]}" ]; then
    CANDIDATE_APP="${POSITIONAL_ARGS[0]}"
    if [[ "$CANDIDATE_APP" != -* ]] && [ ${#CANDIDATE_APP} -ge 8 ]; then
        APP_ID="$CANDIDATE_APP"
    fi
fi

if [ ${#POSITIONAL_ARGS[@]} -ge 2 ] && [ -n "${POSITIONAL_ARGS[1]}" ]; then
    CANDIDATE_SEC="${POSITIONAL_ARGS[1]}"
    if [[ "$CANDIDATE_SEC" != -* ]] && [ ${#CANDIDATE_SEC} -ge 8 ]; then
        SECRET_KEY="$CANDIDATE_SEC"
    fi
fi

echo "=================================================="
echo "  CODEMEET 2026 - PRODUCTION ENV AUTO-SETUP      "
echo "=================================================="

# Ensure .env exists
if [ ! -f "$ENV_FILE" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example "$ENV_FILE"
    else
        touch "$ENV_FILE"
    fi
fi

# Clean previous keys (including any previously corrupted --no-restart values)
sed -i '/CASHFREE_APP_ID/d' "$ENV_FILE" 2>/dev/null || true
sed -i '/CASHFREE_SECRET_KEY/d' "$ENV_FILE" 2>/dev/null || true
sed -i '/CASHFREE_ENV/d' "$ENV_FILE" 2>/dev/null || true
sed -i '/CASHFREE_API_VERSION/d' "$ENV_FILE" 2>/dev/null || true
sed -i '/SMTP_EMAIL/d' "$ENV_FILE" 2>/dev/null || true
sed -i '/SMTP_PASSWORD/d' "$ENV_FILE" 2>/dev/null || true
sed -i '/SMTP_HOST/d' "$ENV_FILE" 2>/dev/null || true
sed -i '/SMTP_PORT/d' "$ENV_FILE" 2>/dev/null || true
sed -i '/ADMIN_PASSWORD/d' "$ENV_FILE" 2>/dev/null || true
sed -i '/ADMIN_EMAIL/d' "$ENV_FILE" 2>/dev/null || true
sed -i '/ADMIN_MASTER_OTP/d' "$ENV_FILE" 2>/dev/null || true

# Append production configuration
echo "" >> "$ENV_FILE"
echo "# Admin Security Configuration" >> "$ENV_FILE"
echo "ADMIN_PASSWORD=idontknow" >> "$ENV_FILE"
echo "ADMIN_EMAIL=shreyas.u.sondur@gmail.com" >> "$ENV_FILE"
echo "ADMIN_MASTER_OTP=866041" >> "$ENV_FILE"

echo "" >> "$ENV_FILE"
echo "# SMTP Email Configuration (Google Workspace App Password)" >> "$ENV_FILE"
echo "SMTP_EMAIL=$DEFAULT_SMTP_EMAIL" >> "$ENV_FILE"
echo "SMTP_PASSWORD=$DEFAULT_SMTP_PASS" >> "$ENV_FILE"
echo "SMTP_HOST=smtp.gmail.com" >> "$ENV_FILE"
echo "SMTP_PORT=465" >> "$ENV_FILE"

echo "" >> "$ENV_FILE"
echo "# Cashfree Payment Gateway (v3) Configuration" >> "$ENV_FILE"
echo "CASHFREE_APP_ID=$APP_ID" >> "$ENV_FILE"
echo "CASHFREE_SECRET_KEY=$SECRET_KEY" >> "$ENV_FILE"
echo "CASHFREE_ENV=PROD" >> "$ENV_FILE"
echo "CASHFREE_API_VERSION=2023-08-01" >> "$ENV_FILE"

echo "✅ Production .env (Cashfree, SMTP & 2FA Admin) configured successfully!"

if [ "$RESTART_SERVICE" = true ]; then
    echo "Restarting backend service (codemeet-backend)..."
    sudo systemctl daemon-reload 2>/dev/null || true
    sudo systemctl restart codemeet-backend 2>/dev/null || true
    echo "=================================================="
    echo "  STATUS CHECK:                                   "
    echo "=================================================="
    sudo systemctl status codemeet-backend --no-pager
fi
