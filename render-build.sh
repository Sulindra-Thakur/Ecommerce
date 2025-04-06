#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install client dependencies
echo "Installing client dependencies..."
cd client
npm install
# Ensure we have the correct version of @vitejs/plugin-react
npm install @vitejs/plugin-react@4.0.0 --save-dev

# Return to root
cd ..

# Build client
echo "Building client..."
npm run build-client

echo "Build complete!" 