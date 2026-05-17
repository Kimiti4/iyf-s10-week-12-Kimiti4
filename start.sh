#!/bin/bash
# Wrapper script to install dependencies and start backend from subdirectory
echo "📦 Installing dependencies..."
cd /app/iyf-s10-week-11-Kimiti4
npm install --omit=dev
echo "✅ Dependencies installed, starting server..."
exec node server.js
