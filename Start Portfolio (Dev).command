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

echo "Starting portfolio dev server (webpack)…"
echo "Leave this window open."
echo ""
echo "1) Wait for: Ready"
echo "2) Open http://127.0.0.1:3000"
echo "3) First visit may show \"Compiling /\" for several minutes — that is normal."
echo "   Do not close Terminal until the page appears."
echo ""

npm run dev
