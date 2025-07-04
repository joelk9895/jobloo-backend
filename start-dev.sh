#!/bin/bash

# Start both servers
echo "Starting NestJS backend and static server..."

# Function to handle cleanup when script is terminated
cleanup() {
  echo "Stopping all processes..."
  kill $(jobs -p) 2>/dev/null
  exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

# Check if nodemon is installed
if command -v nodemon &> /dev/null; then
  echo "Starting backend with nodemon for auto-reloading..."
  nodemon -w src --exec "npm run start:dev" &
else
  echo "Starting backend with npm..."
fi

# Start static server
node server.js &

# Wait for all background processes to finish
wait
