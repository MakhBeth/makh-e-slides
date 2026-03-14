#!/usr/bin/env bash
set -euo pipefail

# Build and serve dist for the current branch
# Usage: ./scripts/serve-dist.sh [port]

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${1:-4173}"

echo "=== Building current branch ==="
npx --prefix "$REPO_DIR" vite build

echo ""
npx --prefix "$REPO_DIR" vite preview --port "$PORT" --open /slides/
