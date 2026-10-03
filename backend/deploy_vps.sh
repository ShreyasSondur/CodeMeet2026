#!/bin/bash
set -e

CURRENT_DIR=$(pwd)
echo "=================================================="
echo "  CODEMEET 2026 AUTO-DEPLOYMENT ON CONTABO VPS    "
echo "  Target Directory: $CURRENT_DIR"
echo "=================================================="

# 1. Prepare production .env
if [ -f "env_prod.txt" ]; then
    echo "[1/6] Setting up production .env file..."
    cp env_prod.txt .env
fi

# 2. Install system packages
echo "[2/6] Installing python3-venv, pip, and nginx..."
sudo apt update
sudo apt install -y python3-venv python3-pip nginx certbot python3-certbot-nginx

# 3. Create venv and install dependencies
echo "[3/6] Setting up Python virtual environment..."
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# 4. Configure Systemd Service (Port 8001)
echo "[4/6] Installing and starting systemd service (Port 8001)..."
cat <<EOF | sudo tee /etc/systemd/system/codemeet-backend.service > /dev/null
[Unit]
Description=CodeMeet 2026 FastAPI Backend Daemon
After=network.target

[Service]
User=root
WorkingDirectory=$CURRENT_DIR
ExecStart=$CURRENT_DIR/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8001 --workers 4
Restart=always
RestartSec=5
EnvironmentFile=$CURRENT_DIR/.env

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable codemeet-backend
sudo systemctl restart codemeet-backend

# 5. Configure Nginx Reverse Proxy
echo "[5/6] Configuring Nginx reverse proxy..."
sudo cp codemeet_nginx.conf /etc/nginx/sites-available/codemeet-backend
sudo ln -sf /etc/nginx/sites-available/codemeet-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 6. Status check
echo "[6/6] Verifying service status..."
sudo systemctl status codemeet-backend --no-pager

echo ""
echo "=================================================="
echo "  DEPLOYMENT COMPLETE! RUNNING ON PORT 8001       "
echo "  Nginx Proxy configured for api.hackathon.suiet.website"
echo "  To enable HTTPS SSL, run:                      "
echo "    sudo certbot --nginx -d api.hackathon.suiet.website"
echo "=================================================="
