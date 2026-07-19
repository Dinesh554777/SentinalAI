#!/bin/bash
# ============================================================
# SentinelAI — Railway Deployment Script
# ============================================================
# Prerequisites: npm install -g @railway/cli
# Usage: bash deploy-railway.sh
# ============================================================

set -e

echo "========================================="
echo "  SentinelAI — Railway Deployment"
echo "========================================="

# Check railway CLI
if ! command -v railway &> /dev/null; then
    echo "Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Login
echo "[1/4] Logging in to Railway..."
railway login

# Init project (if not already)
if [ ! -f "railway.json" ]; then
    echo "[2/4] Initializing Railway project..."
    railway init
else
    echo "[2/4] Project already initialized"
fi

# Add PostgreSQL plugin
echo "[3/4] Adding PostgreSQL..."
railway add --plugin postgresql || echo "PostgreSQL already added"

# Add Redis plugin
echo "[3/4] Adding Redis..."
railway add --plugin redis || echo "Redis already added"

# Set environment variables
echo "[4/4] Setting environment variables..."
railway variables set JWT_SECRET_KEY="$(openssl rand -hex 32)"
railway variables set GROQ_MODEL="llama-3.3-70b-versatile"
railway variables set HOST="0.0.0.0"
railway variables set PORT="8000"
railway variables set CORS_ORIGINS="*"

echo ""
echo "========================================="
echo "  Setup Complete!"
echo "========================================="
echo ""
echo "  Next steps:"
echo "  1. Go to Railway dashboard"
echo "  2. Set GROQ_API_KEY in variables"
echo "  3. Connect your GitHub repo"
echo "  4. Deploy!"
echo ""
echo "  Or deploy from CLI:"
echo "    railway up"
echo ""
