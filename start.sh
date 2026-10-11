#!/bin/bash
echo "🛒 Starting Pushpa Paridhan..."
echo ""

# Start backend
echo "Starting backend on port 5001..."
cd "$(dirname "$0")/backend"
node server.js &
BACKEND_PID=$!
sleep 2

# Start frontend
echo "Starting frontend on port 3000..."
cd "$(dirname "$0")/frontend"
npx vite --host &
FRONTEND_PID=$!
sleep 2

echo ""
echo "✅ Both servers are running!"
echo "   🌐 Store:    http://localhost:3000"
echo "   🔧 API:      http://localhost:5001"
echo "   👤 Admin:    http://localhost:3000/admin/login"
echo ""
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
