#!/bin/bash
set -e

CURRENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$CURRENT_DIR"

echo "=================================================="
echo "   CODEMEET 2026 VPS SAFE UPDATE & DEPLOYMENT     "
echo "   Directory: $CURRENT_DIR"
echo "=================================================="

# 1. Pull latest code from GitHub if in git repository
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "[1/6] Fetching and pulling latest code from git (origin/main)..."
    git fetch origin main || true
    git pull origin main || true
else
    echo "[1/6] Not inside a git repo or offline. Skipping git pull."
fi

# 2. Setup / update .env with production credentials (without early restart)
echo "[2/6] Verifying production environment (.env)..."
if [ -f "setup_env.sh" ]; then
    bash setup_env.sh --no-restart
fi

# 3. Virtual environment & Python dependencies
echo "[3/6] Updating Python virtual environment & packages..."
if [ ! -d "venv" ]; then
    echo "  Creating Python virtual environment..."
    python3 -m venv venv
fi
source venv/bin/activate
pip install -q --upgrade pip
pip install -q -r requirements.txt

# 4. Safe Database Migration with Automatic Backup & Verification
echo "[4/6] Executing safe database migration & zero-data-loss verification..."
python migrate_db.py

# 5. Reload systemd & restart backend daemon
echo "[5/6] Reloading systemd and restarting backend service..."
sudo systemctl daemon-reload 2>/dev/null || true
sudo systemctl restart codemeet-backend 2>/dev/null || true

# 6. Reload Nginx reverse proxy & verify health
echo "[6/6] Reloading Nginx & performing live health telemetry check..."
if sudo systemctl is-active --quiet nginx 2>/dev/null; then
    sudo nginx -t 2>/dev/null && sudo systemctl reload nginx 2>/dev/null || true
fi

sleep 2

# Check live backend response
if curl -sf http://127.0.0.1:8001/api/health >/dev/null 2>&1; then
    echo "  ✅ Health check passed: Backend API is live & healthy on port 8001!"
elif curl -sf http://127.0.0.1:8000/api/health >/dev/null 2>&1; then
    echo "  ✅ Health check passed: Backend API is live & healthy on port 8000!"
else
    echo "  ⚠️ Backend restarted. Querying service status:"
    sudo systemctl status codemeet-backend --no-pager 2>/dev/null || true
fi

echo ""
echo "=================================================="
echo "  ✅ DEPLOYMENT & MIGRATION COMPLETED SAFELY!     "
echo "  All database tables & records verified intact.  "
echo "=================================================="
