#!/bin/sh
set -eu

# Deploy slides from specific branches to GitHub Pages (makhbeth.github.io)
# Usage: ./scripts/deploy.sh

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PAGES_DIR="/Users/davidedipumpo/Projects/makhbeth.github.io"
BUILD_OUT="$REPO_DIR/src/dist"

BRANCHES="resilienza know-css-2026"

CURRENT_BRANCH="$(git -C "$REPO_DIR" branch --show-current)"

for BRANCH in $BRANCHES; do
  echo "=== Building branch: $BRANCH -> /$BRANCH ==="

  git -C "$REPO_DIR" checkout "$BRANCH"
  npm --prefix "$REPO_DIR" install --silent
  npx --prefix "$REPO_DIR" vite build --base "/$BRANCH/"

  rm -rf "$PAGES_DIR/$BRANCH"
  cp -r "$BUILD_OUT" "$PAGES_DIR/$BRANCH"

  rm -rf "$BUILD_OUT"
  echo "  -> Deployed to $PAGES_DIR/$BRANCH"
done

git -C "$REPO_DIR" checkout "$CURRENT_BRANCH"

cd "$PAGES_DIR"
git add -A
git commit -m "Deploy $BRANCHES slides"
git push

echo ""
echo "Done! Published:"
for BRANCH in $BRANCHES; do
  echo "  https://makhbeth.github.io/$BRANCH/"
done
