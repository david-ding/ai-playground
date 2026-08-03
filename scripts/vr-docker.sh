#!/usr/bin/env bash
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "Building local CI toolchain Docker image..."
docker build \
  -t ci-toolchain:verify \
  -f .github/docker/ci-toolchain.Dockerfile \
  .

echo "Running VR tests inside Docker container..."
docker run --rm \
  -v "$REPO_ROOT:/workspace" \
  -w /workspace \
  -e CI=true \
  ci-toolchain:verify \
  yarn vr:test "$@"

echo "Fixing snapshot permissions on host..."
chown -R "$(id -u):$(id -g)" packages/web/__screenshots__ packages/web/playwright-report 2>/dev/null || true
