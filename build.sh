#!/bin/bash
# Vercel Build Script
# This script prepares the frontend for Vercel deployment

echo "Building ROMGON for Vercel..."

# Copy frontend files to public directory (Vercel's default)
mkdir -p public
cp -r frontend/* public/ 2>/dev/null || true

echo "✅ Frontend prepared for deployment"
