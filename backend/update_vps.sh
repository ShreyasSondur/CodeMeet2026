#!/bin/bash
set -e

CURRENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$CURRENT_DIR"

echo "=================================================="
echo "   CODEMEET 2026 VPS QUICK UPDATE & RESTART      "
echo "   Directory: $CURRENT_DIR"
echo "=================================================="

# 1. Setup / update .env with production Cashfree settings
bash setup_env.sh

# 2. Update Python dependencies in virtual environment if present
if [ -d "venv" ]; then
    echo "[2/4] Updating Python packages in venv..."
    source venv/bin/activate
    pip install -q --upgrade pip
    pip install -q -r requirements.txt
fi

# 3. Reload Nginx if enabled
if sudo systemctl is-active --quiet nginx 2>/dev/null; then
    echo "[3/4] Reloading Nginx..."
    sudo systemctl reload nginx
fi

echo ""
echo "=================================================="
echo "  ✅ ALL DONE! BACKEND IS LIVE & CONNECTED        "
echo "=================================================="
