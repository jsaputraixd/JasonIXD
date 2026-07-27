#!/bin/bash
# Double-click in Finder to start the local dev site (macOS).
cd "$(dirname "$0")" || exit 1

if ! command -v node >/dev/null 2>&1; then
  osascript -e 'display alert "Node.js not found" message "Install Node 20+ from https://nodejs.org then try again."'
  exit 1
fi

if [ ! -d "node_modules" ]; then
  osascript -e 'display alert "Dependencies missing" message "Open Terminal in this folder and run: npm install"'
  exit 1
fi

echo "Starting portfolio dev server…"
echo "First start can take 2–3 minutes. Leave this window open."
echo ""
echo "When you see \"Ready\", open: http://127.0.0.1:3000"
echo ""

npm run dev:turbo
