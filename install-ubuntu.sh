#!/usr/bin/env bash
set -e
APP="$HOME/.local/share/teynex-ai"
echo "[TEYNEX] Installing..."
apt-get update -y
apt-get install -y git curl ca-certificates build-essential
if ! command -v node >/dev/null 2>&1 || [ "$(node -p 'parseInt(process.versions.node)')" -lt 20 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
rm -rf "$APP"
git clone --depth 1 https://github.com/asadbek784/Teynex-cli-.git "$APP"
cd "$APP"
npm install --no-audit --no-fund
npm run build
npm install -g . --no-audit --no-fund
echo "✓ Teynex installed. Run: teynex"
