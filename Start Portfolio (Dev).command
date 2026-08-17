#!/bin/bash
# Double-click in Finder to start the local dev site (macOS).
cd "$(dirname "$0")" || exit 1

if ! command -v node >/dev/null 2>&1; then
  osascript -e 'display alert "Node.js not found" message "Install Node 20+ from https://nodejs.org then try again."'
  exit 1
fi

# iCloud Documents can evict node_modules. Next then crashes on boot:
#   Error: ETIMEDOUT: connection timed out, read
#   ERR_CONNECTION_REFUSED on http://127.0.0.1:3000
if [ -e "node_modules/next/package.json" ] && ls -lO "node_modules/next/package.json" 2>/dev/null | grep -q dataless; then
  echo "iCloud evicted node_modules — reinstalling so the server can start…"
  echo ""
  rm -rf node_modules
fi

if [ ! -d "node_modules" ]; then
  echo "Installing dependencies (first time or after iCloud restore)…"
  echo ""
  npm install || {
    osascript -e 'display alert "npm install failed" message "Open Terminal in this folder and run: npm install"'
    exit 1
  }
fi

echo "Starting portfolio dev server…"
echo "First start can take 2–3 minutes. Leave this window open."
echo ""
echo "When you see \"Ready\", open: http://127.0.0.1:3000"
echo ""

npm run dev:turbo
