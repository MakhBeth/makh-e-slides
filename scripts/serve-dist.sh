#!/bin/sh
set -eu

# Build and serve dist for the current branch
# Usage: ./scripts/serve-dist.sh [port]

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_OUT="$REPO_DIR/src/dist"
PORT="${1:-4173}"

echo "=== Building current branch ==="
npx --prefix "$REPO_DIR" vite build

# Flatten: move slides/* to root
mv "$BUILD_OUT/slides/"* "$BUILD_OUT/"
rmdir "$BUILD_OUT/slides"

echo ""
echo "Serving on http://localhost:$PORT"
npx serve "$BUILD_OUT" -l "$PORT"
