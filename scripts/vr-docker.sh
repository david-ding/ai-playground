#!/usr/bin/env bash
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

if [ -f /.dockerenv ] || { [ "${CI:-false}" = "true" ] && [ ! -S /var/run/docker.sock ]; }; then
  node packages/web/vr-tests/build.mjs
  playwright test --config packages/web/vr-tests/playwright.config.ts "$@"
  exit 0
fi

echo "Building local CI toolchain Docker image..."
docker build \
  -t ci-toolchain:verify \
  -f .github/docker/ci-toolchain.Dockerfile \
  .

NODE_MODULES_VOLUME=ai-playground-node-modules
NESTED_NODE_MODULES_VOLUME=ai-playground-nested-node-modules
YARN_CACHE_VOLUME=ai-playground-yarn-cache

# The host's node_modules is built for macOS; its native bindings
# (oxc-resolver, lightningcss, ...) cannot load inside the Linux container.
# Give the container its own Linux node_modules (named volumes) plus a yarn
# cache, and install once inside the container. Workspace nested node_modules
# dirs are shadowed with a separate volume so the container never reads or
# writes host artifacts (mounting the same volume in multiple places would
# make a package resolve as two different module instances).
run_in_container() {
  docker run --rm \
    -v "$REPO_ROOT:/workspace" \
    -v "$NODE_MODULES_VOLUME:/workspace/node_modules" \
    -v "$NESTED_NODE_MODULES_VOLUME:/workspace/packages/web/node_modules" \
    -v "$NESTED_NODE_MODULES_VOLUME:/workspace/packages/server/node_modules" \
    -v "$NESTED_NODE_MODULES_VOLUME:/workspace/packages/brand-theme/node_modules" \
    -v "$NESTED_NODE_MODULES_VOLUME:/workspace/packages/mcp-api-tool/node_modules" \
    -v "$YARN_CACHE_VOLUME:/yarn-cache" \
    -w /workspace \
    -e CI=true \
    -e YARN_CACHE_FOLDER=/yarn-cache \
    ${NODE_AUTH_TOKEN:+-e NODE_AUTH_TOKEN="$NODE_AUTH_TOKEN"} \
    ci-toolchain:verify \
    "$@"
}

echo "Installing Linux dependencies inside the container (first run fetches; @david-ding/brand-theme needs NODE_AUTH_TOKEN if not cached)..."
run_in_container bash -c 'export PATH="/workspace/node_modules/.bin:$PATH"; yarn install --immutable && node packages/web/vr-tests/build.mjs && playwright test --config packages/web/vr-tests/playwright.config.ts "$@"' _ "$@"

echo "Fixing snapshot permissions on host..."
chown -R "$(id -u):$(id -g)" packages/web/__screenshots__ packages/web/playwright-report .yarn 2>/dev/null || true
