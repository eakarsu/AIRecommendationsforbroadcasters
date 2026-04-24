#!/bin/bash

set -e

echo "============================================"
echo "  BroadcastAI - Content Recommendation Hub"
echo "============================================"
echo ""

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

BACKEND_PORT=${BACKEND_PORT:-4001}
FRONTEND_PORT=${FRONTEND_PORT:-3000}

# --- Clean up used ports ---
echo "[1/6] Cleaning up ports $BACKEND_PORT and $FRONTEND_PORT..."
cleanup_port() {
  local port=$1
  local pids=$(lsof -ti :$port 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "  Killing processes on port $port: $pids"
    echo "$pids" | xargs kill -9 2>/dev/null || true
    sleep 1
  fi
}
cleanup_port $BACKEND_PORT
cleanup_port $FRONTEND_PORT
echo "  Ports cleaned."

# --- Install dependencies ---
echo ""
echo "[2/6] Installing backend dependencies..."
cd backend
npm install --silent 2>&1 | tail -1
cd ..

echo "[3/6] Installing frontend dependencies..."
cd frontend
npm install --silent 2>&1 | tail -1
cd ..

# --- Setup PostgreSQL Database ---
echo ""
echo "[4/6] Setting up PostgreSQL database..."
DB_NAME=${DB_NAME:-broadcaster_db}
DB_USER=${DB_USER:-erolakarsu}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}

# Check if PostgreSQL is running
if ! pg_isready -h $DB_HOST -p $DB_PORT -q 2>/dev/null; then
  echo "  Starting PostgreSQL..."
  brew services start postgresql@14 2>/dev/null || true
  sleep 2
fi

# Create database if not exists
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" 2>/dev/null | grep -q 1 || \
  createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME 2>/dev/null || true
echo "  Database '$DB_NAME' ready."

# --- Seed Database ---
echo ""
echo "[5/6] Seeding database with sample data..."
cd backend
node seed.js
cd ..

# --- Start Application with Hot Reload ---
echo ""
echo "[6/6] Starting application with hot reload..."
echo ""
echo "  Backend:  http://localhost:$BACKEND_PORT"
echo "  Frontend: http://localhost:$FRONTEND_PORT"
echo ""
echo "  Press Ctrl+C to stop all services"
echo "============================================"
echo ""

# Trap to cleanup on exit
cleanup() {
  echo ""
  echo "Shutting down..."
  cleanup_port $BACKEND_PORT
  cleanup_port $FRONTEND_PORT
  kill $(jobs -p) 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM

# Start backend with nodemon for hot reload
cd backend
npx nodemon --watch . --ext js,json server.js &
BACKEND_PID=$!
cd ..

# Start frontend with Vite (built-in hot reload)
cd frontend
npx vite --port $FRONTEND_PORT --host &
FRONTEND_PID=$!
cd ..

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
