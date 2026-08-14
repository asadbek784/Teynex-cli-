#!/usr/bin/env bash
set -euo pipefail

# Teynex AI — Ubuntu/proot-distro installer
# Usage inside Ubuntu:
#   bash install-ubuntu.sh
# Or from a remote/raw script:
#   curl -fsSL RAW_URL | bash -s -- REPO_URL

REPO_URL="${1:-${TEYNEX_REPO_URL:-}}"
INSTALL_DIR="${TEYNEX_INSTALL_DIR:-$HOME/.local/share/teynex-ai}"
NODE_MAJOR="${TEYNEX_NODE_MAJOR:-22}"

say() { printf '\033[1;37m[TEYNEX]\033[0m %s\n' "$*"; }
fail() { printf '\033[1;31m[TEYNEX ERROR]\033[0m %s\n' "$*" >&2; exit 1; }

if [[ "${EUID:-$(id -u)}" -eq 0 && -n "${SUDO_USER:-}" ]]; then
  # Keep the install in the real user's HOME when invoked through sudo.
  export HOME="$(getent passwd "$SUDO_USER" | cut -d: -f6 || echo "$HOME")"
fi

say "Detecting Ubuntu/proot environment..."
if ! grep -qiE 'ubuntu|debian' /etc/os-release 2>/dev/null; then
  say "Warning: this installer is intended for Ubuntu/Debian. Continuing anyway."
fi

if command -v apt-get >/dev/null 2>&1; then
  say "Installing base packages..."
  if [[ "${EUID:-$(id -u)}" -eq 0 ]]; then
    apt-get update -y
    DEBIAN_FRONTEND=noninteractive apt-get install -y ca-certificates curl git build-essential
  else
    fail "Run this inside proot-distro Ubuntu as root, or run: proot-distro login ubuntu"
  fi
fi

# Install Node.js 22 without requiring a global Node/npm pre-install.
if ! command -v node >/dev/null 2>&1 || ! node -e 'process.exit(Number(process.versions.node.split(".")[0]) >= 20 ? 0 : 1)' 2>/dev/null; then
  say "Installing Node.js ${NODE_MAJOR}..."
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [[ ! -s "$NVM_DIR/nvm.sh" ]]; then
    curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
  fi
  # shellcheck disable=SC1090
  source "$NVM_DIR/nvm.sh"
  nvm install "$NODE_MAJOR"
  nvm alias default "$NODE_MAJOR"
  nvm use default >/dev/null
else
  say "Node.js $(node -v) already installed."
fi

command -v node >/dev/null 2>&1 || fail "Node.js installation failed."
command -v npm >/dev/null 2>&1 || fail "npm installation failed."

if [[ -z "$REPO_URL" ]]; then
  # If running from a cloned repository, use the current repo automatically.
  if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    REPO_URL="$(git config --get remote.origin.url || true)"
  fi
fi

if [[ -z "$REPO_URL" ]]; then
  fail "Repository URL is missing. From a cloned repo run: bash install-ubuntu.sh\nOr use: curl -fsSL RAW_INSTALL_URL | bash -s -- https://github.com/USER/REPO.git"
fi

say "Installing Teynex from: $REPO_URL"
rm -rf "$INSTALL_DIR"
mkdir -p "$(dirname "$INSTALL_DIR")"
git clone --depth 1 "$REPO_URL" "$INSTALL_DIR"
cd "$INSTALL_DIR"

say "Installing npm dependencies and building Teynex..."
npm install --no-audit --no-fund
npm run build

# npm global installs under nvm do not need sudo.
npm install -g . --no-audit --no-fund

say "Teynex installed successfully."
printf '\n'
printf '  Command:  teynex\n'
printf '  Setup:    teynex setup\n'
printf '  Doctor:   teynex doctor\n'
printf '  Version:  teynex --version\n'
printf '\n'
printf 'If "teynex" is not found in a new shell, run:\n'
printf '  source "$HOME/.nvm/nvm.sh"\n'
printf '\n'
