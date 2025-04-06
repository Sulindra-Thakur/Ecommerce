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
npm install --force

# Go back to root
cd ..

# Build client
echo "Building client directly..."
cd client
npm run build

echo "Build complete!" 