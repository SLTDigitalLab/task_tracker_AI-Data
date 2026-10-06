#!/bin/bash

# ==============================================================================
# SLTMOBITEL BA Progress Tracker - Local Launcher
# ==============================================================================

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "=========================================================="
echo "  🚀 Starting SLTMOBITEL BA Progress Tracker"
echo "=========================================================="

# 1. Check PostgreSQL
echo "--> Checking PostgreSQL status..."
if ! pg_isready -q 2>/dev/null; then
    echo "--> PostgreSQL is not running. Attempting to start via Homebrew..."
    if command -v brew &> /dev/null; then
        brew services start postgresql@18 || brew services start postgresql || true
        sleep 2
    fi
fi

if pg_isready -q 2>/dev/null; then
    echo "    ✓ PostgreSQL is ready."
else
    echo "    ⚠️ Warning: PostgreSQL might not be responding. Please check your Postgres service."
fi

# 2. Check / Generate Prisma Client
echo "--> Checking database schema & Prisma client..."
(cd backend && npx prisma generate > /dev/null 2>&1)
echo "    ✓ Prisma Client ready."

# 3. Open browser after short delay
(
  sleep 3
  if command -v open &> /dev/null; then
    open "http://localhost:5173"
  fi
) &

# 4. Launch Backend and Frontend concurrently
echo "--> Starting Backend on http://localhost:5001"
echo "--> Starting Frontend on http://localhost:5173"
echo "=========================================================="
echo "  Default Login Accounts:"
echo "  - Supervisor : supervisor / password123"
echo "  - BA Staff   : alicesmith / password123"
echo "=========================================================="

npm run dev
