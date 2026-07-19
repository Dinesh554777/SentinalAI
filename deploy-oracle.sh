#!/bin/bash
# ============================================================
# SentinelAI — Oracle Cloud Free Tier Deployment Script
# ============================================================
# Run this on an Oracle Cloud Always Free VM (Ubuntu 22.04+)
# Usage: bash deploy-oracle.sh
# ============================================================

set -e

echo "========================================="
echo "  SentinelAI — Oracle Cloud Deployment"
echo "========================================="

# --- 1. System Update + Docker ---
echo "[1/6] Installing Docker..."
sudo apt update -y
sudo apt install -y docker.io docker-compose-plugin git
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER

echo "[2/6] Cloning repository..."
if [ ! -d "SentinalAI" ]; then
    git clone https://github.com/your-username/SentinalAI.git
fi
cd SentinalAI

echo "[3/6] Creating .env from template..."
if [ ! -f .env ]; then
    cp .env.production .env
    echo ""
    echo "============================================="
    echo "  IMPORTANT: Edit .env with real values!"
    echo "============================================="
    echo ""
    echo "  Required changes:"
    echo "  - POSTGRES_PASSWORD (generate a strong one)"
    echo "  - JWT_SECRET_KEY (run: openssl rand -hex 32)"
    echo "  - GROQ_API_KEY (from console.groq.com)"
    echo "  - SMTP_USER / SMTP_PASSWORD (for email)"
    echo ""
    echo "  Then run this script again."
    exit 1
fi

echo "[4/6] Building containers..."
docker compose build

echo "[5/6] Starting services..."
docker compose up -d

echo "[6/6] Waiting for health check..."
sleep 5
curl -sf http://localhost/api/health || echo "Warning: health check failed, services may still be starting"

echo ""
echo "========================================="
echo "  Deployment Complete!"
echo "========================================="
echo ""
echo "  Frontend:  http://$(curl -s ifconfig.me)"
echo "  Backend:   http://$(curl -s ifconfig.me)/api/"
echo "  Health:    http://$(curl -s ifconfig.me)/api/health"
echo ""
echo "  Default login: admin@bank.com / admin123"
echo ""
echo "  Manage:"
echo "    docker compose logs -f        # view logs"
echo "    docker compose restart         # restart all"
echo "    docker compose down            # stop all"
echo ""
