#!/bin/bash
# Double-click in Finder to start the local dev site (macOS).
cd "$(dirname "$0")" || exit 1

if ! command -v node >/dev/null 2>&1; then
  osascript -e 'display alert "Node.js not found" message "Install Node 20+ from https://nodejs.org then try again."'
  exit 1
fi

validate_next() {
  node -e "JSON.parse(require('fs').readFileSync('node_modules/next/package.json','utf8'))" 2>/dev/null
}

if [ ! -d "node_modules" ] || ! validate_next; then
  echo "Repairing dependencies (node_modules missing or corrupted)…"
  echo "This can take a few minutes."
  echo ""
  if ! npm install; then
    echo ""
    echo "npm install failed. In Terminal, run:"
    echo "  cd \"$(pwd)\""
    echo "  rm -rf node_modules .next"
    echo "  npm install"
    read -r -p "Press Enter to close…"
    exit 1
  fi
  if ! validate_next; then
    echo ""
    echo "Still broken after npm install. Try a clean reinstall:"
    echo "  cd \"$(pwd)\""
    echo "  rm -rf node_modules .next"
    echo "  npm install"
    read -r -p "Press Enter to close…"
    exit 1
  fi
  echo "Dependencies OK."
  echo ""
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
EXIT=$?
if [ "$EXIT" -ne 0 ]; then
  echo ""
  echo "Dev server exited with error ($EXIT)."
  echo "If you saw ERR_INVALID_PACKAGE_CONFIG, run in Terminal:"
  echo "  cd \"$(pwd)\""
  echo "  rm -rf node_modules .next"
  echo "  npm install"
  echo "  npm run dev"
  read -r -p "Press Enter to close…"
fi
exit "$EXIT"
