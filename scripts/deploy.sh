#!/bin/sh
set -eu

# Deploy current branch to GitHub Pages (makhbeth.github.io)
# Usage: ./scripts/deploy.sh

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PAGES_DIR="/Users/davidedipumpo/Projects/makhbeth.github.io"
BUILD_OUT="$REPO_DIR/src/dist"

BRANCH="$(git -C "$REPO_DIR" branch --show-current)"

echo "=== Building branch: $BRANCH -> /$BRANCH ==="

npx --prefix "$REPO_DIR" vite build --base "/$BRANCH/"

rm -rf "$PAGES_DIR/$BRANCH"

# Flatten: move slides/* to root so URLs are /branch/index.html not /branch/slides/index.html
mv "$BUILD_OUT/slides/"* "$BUILD_OUT/"
rmdir "$BUILD_OUT/slides"

cp -r "$BUILD_OUT" "$PAGES_DIR/$BRANCH"
rm -rf "$BUILD_OUT"

cd "$PAGES_DIR"
git add -A
if git diff --cached --quiet; then
  echo "No changes to deploy."
else
  git commit -m "Deploy $BRANCH slides"
  git push
fi

echo ""
echo "Done! Published:"
echo "  https://makhbeth.github.io/$BRANCH/"
