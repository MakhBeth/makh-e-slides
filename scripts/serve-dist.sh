#!/usr/bin/env bash
set -euo pipefail

# Build and serve dist for both branches locally
# Usage: ./scripts/serve-dist.sh [port]

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_OUT="$REPO_DIR/src/dist"
SERVE_DIR="$REPO_DIR/.serve"
PORT="${1:-4173}"

declare -A BRANCHES=(
  [resilienza]="resilienza"
  [know-css-2026]="know-css-2026"
)

CURRENT_BRANCH="$(git -C "$REPO_DIR" branch --show-current)"

rm -rf "$SERVE_DIR"
mkdir -p "$SERVE_DIR"

# Create index page
cat > "$SERVE_DIR/index.html" <<'HTMLEOF'
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Slides</title>
<style>body{font-family:sans-serif;display:grid;place-content:center;height:100vh;background:#111;color:#eee}a{color:#6699cc;font-size:2rem;display:block;margin:1rem}</style>
</head>
<body>
<div>
<a href="/resilienza/slides/">Resilienza del Frontend</a>
<a href="/know-css-2026/slides/">What you don't know about CSS v2</a>
</div>
</body>
</html>
HTMLEOF

for BRANCH in "${!BRANCHES[@]}"; do
  SUBDIR="${BRANCHES[$BRANCH]}"
  echo "=== Building branch: $BRANCH -> /$SUBDIR ==="

  git -C "$REPO_DIR" checkout "$BRANCH"
  npm --prefix "$REPO_DIR" install --silent
  npx --prefix "$REPO_DIR" vite build --base "/$SUBDIR/"

  cp -r "$BUILD_OUT" "$SERVE_DIR/$SUBDIR"
  rm -rf "$BUILD_OUT"
done

git -C "$REPO_DIR" checkout "$CURRENT_BRANCH"

echo ""
echo "Serving on http://localhost:$PORT"
echo "  http://localhost:$PORT/resilienza/slides/"
echo "  http://localhost:$PORT/know-css-2026/slides/"
echo ""

npx serve "$SERVE_DIR" -l "$PORT"
