#!/bin/bash

echo "Starting QR Dashboard..."

# Start the API server in the background
echo "Starting API server on port 3334..."
node server.js &
API_PID=$!

# Wait a moment for the API to start
sleep 2

# Start the React app
echo "Starting React app on port 3700..."
cd dashboard
npm start &
REACT_PID=$!

# Function to handle shutdown
cleanup() {
    echo "Shutting down..."
    kill $API_PID
    kill $REACT_PID
    exit 0
}

# Trap SIGINT and SIGTERM
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait 