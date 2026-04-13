#!/bin/sh
set -e

# Start Go API in background
./bin/api &

# Start Node.js static/proxy server in foreground
node server/server.js
