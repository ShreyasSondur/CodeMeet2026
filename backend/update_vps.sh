#!/bin/bash
set -e

CURRENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$CURRENT_DIR"

echo "=================================================="
echo "   CODEMEET 2026 VPS QUICK UPDATE & RESTART      "
echo "   Directory: $CURRENT_DIR"
echo "=================================================="

# 1. Check or initialize .env
if [ ! -f ".env" ]; then
    echo "[1/4] Creating .env from .env.example..."
    cp .env.example .env
fi

# 2. Check for Cashfree configuration in .env
if ! grep -q "CASHFREE_APP_ID=" .env 2>/dev/null || grep -q "your_cashfree_app_id" .env 2>/dev/null; then
    echo "⚠️ Cashfree keys missing or default in .env."
    if [ -n "$1" ] && [ -n "$2" ]; then
        echo "Applying provided Cashfree credentials..."
        sed -i "/CASHFREE_APP_ID/d" .env 2>/dev/null || true
        sed -i "/CASHFREE_SECRET_KEY/d" .env 2>/dev/null || true
        sed -i "/CASHFREE_ENV/d" .env 2>/dev/null || true
        sed -i "/CASHFREE_API_VERSION/d" .env 2>/dev/null || true
        echo "CASHFREE_APP_ID=$1" >> .env
        echo "CASHFREE_SECRET_KEY=$2" >> .env
        echo "CASHFREE_ENV=PROD" >> .env
        echo "CASHFREE_API_VERSION=2023-08-01" >> .env
    fi
fi

# 3. Update dependencies in virtual environment if present
if [ -d "venv" ]; then
    echo "[2/4] Updating Python packages in venv..."
    source venv/bin/activate
    pip install -q --upgrade pip
    pip install -q -r requirements.txt
fi

# 4. Restart backend systemd service
echo "[3/4] Reloading daemon and restarting codemeet-backend..."
sudo systemctl daemon-reload
sudo systemctl restart codemeet-backend

# 5. Reload Nginx if enabled
if sudo systemctl is-active --quiet nginx; then
    sudo systemctl reload nginx
fi

# 6. Verify local service health
echo "[4/4] Verifying backend status..."
sleep 1
sudo systemctl status codemeet-backend --no-pager

echo ""
echo "=================================================="
echo "  UPDATE COMPLETE! Service is running.            "
echo "=================================================="
