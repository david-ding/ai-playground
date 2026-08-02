# syntax=docker/dockerfile:1

# Shared CI toolchain image for AI Playground.
# Bakes node + yarn + Playwright (chromium + system deps) so jobs start ready.
# Versions are pinned to .nvmrc / package.json. Rebuilt on toolchain-v* tag push.

FROM node:24.11.0-slim

ARG PLAYWRIGHT_VERSION=1.62.1
ARG YARN_VERSION=4.17.1

# Absolute browser path so lookup is independent of HOME (GH Actions sets HOME=/github/home).
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Bake yarn via corepack at build time. No download at runtime (version is cached).
RUN corepack enable && corepack prepare yarn@${YARN_VERSION} --activate

# Bake only the headless shell — saves ~640MB vs full chromium.
# Playwright auto-falls-back to headless-shell when full chromium is absent.
RUN npx --yes playwright@${PLAYWRIGHT_VERSION} install --with-deps chromium-headless-shell \
    && rm -rf /var/lib/apt/lists/* /root/.npm

# Git is required by publishing/versioning tooling (e.g. peaceiris/actions-gh-pages).
RUN apt-get update \
    && apt-get install -y --no-install-recommends git \
    && rm -rf /var/lib/apt/lists/*

RUN node --version && yarn --version