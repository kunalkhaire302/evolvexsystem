#!/bin/bash
# THE SYSTEM - Unified Startup Script for Linux/macOS
# This script starts both backend and frontend servers

echo "============================================================"
echo " THE SYSTEM - AI-Driven Adaptive Leveling Platform"
echo "============================================================"
echo ""

# Check if MongoDB is running
echo "[1/4] Checking MongoDB connection..."
sleep 1

# Start Backend Server
echo "[2/4] Starting Backend Server..."
cd backend
python3 app.py &
BACKEND_PID=$!
cd ..

# Wait for backend to initialize
echo "[3/4] Waiting for backend to initialize..."
sleep 3

# Start Frontend Server
echo "[4/4] Starting Frontend Server..."
cd frontend
python3 -m http.server 8000 &
FRONTEND_PID=$!
cd ..

echo ""
echo "============================================================"
echo " SERVERS STARTED SUCCESSFULLY!"
echo "============================================================"
echo " Backend:  http://127.0.0.1:5000"
echo " Frontend: http://localhost:8000"
echo "============================================================"
echo ""
echo "Opening browser in 3 seconds..."
sleep 3

# Open browser (works on most Linux systems)
if command -v xdg-open > /dev/null; then
    xdg-open http://localhost:8000
elif command -v open > /dev/null; then
    open http://localhost:8000
fi

echo ""
echo "Press Ctrl+C to stop all servers..."

# Cleanup function
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "All servers stopped. Goodbye!"
    exit 0
}

# Trap Ctrl+C
trap cleanup INT

# Wait for user interrupt
wait
