#!/usr/bin/env bash
set -euo pipefail

REPO="asadbek784/Teynex-cli-"
BIN_NAME="teynex"
INSTALL_DIR="${HOME}/.local/bin"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[teynex]${NC} $*"; }
ok() { echo -e "${GREEN}[✓]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }
err() { echo -e "${RED}[✗]${NC} $*"; }

detect_os() {
  case "$(uname -s)" in
    Linux*)
      if grep -qi microsoft /proc/version 2>/dev/null; then echo "wsl"
      elif [ -n "${TERMUX_VERSION:-}" ] || [ -d "/data/data/com.termux" ]; then echo "termux"
      elif [ -f /etc/os-release ]; then
        . /etc/os-release
        echo "${ID:-linux}"
      else
        echo "linux"
      fi
      ;;
    Darwin*) echo "macos" ;;
    *) echo "unknown" ;;
  esac
}

check_cmd() { command -v "$1" >/dev/null 2>&1; }

install_node() {
  local os="$1"
  if check_cmd node && check_cmd npm; then
    ok "Node.js $(node --version) already installed"
    return
  fi
  log "Installing Node.js..."
  case "$os" in
    termux) pkg install -y nodejs ;;
    ubuntu|debian|pop|linuxmint|elementary|zorin)
      if check_cmd apt; then
        apt update && apt install -y nodejs npm
      elif check_cmd snap; then
        snap install node --classic
      fi
      ;;
    arch|manjaro) pacman -S --noconfirm nodejs npm ;;
    fedora|rhel|centos) dnf install -y nodejs npm ;;
    alpine) apk add nodejs npm ;;
    macos)
      if check_cmd brew; then brew install node
      else err "Install Homebrew first: https://brew.sh"; exit 1; fi
      ;;
    *) warn "Unknown OS; please install Node.js >= 18 manually"; exit 1 ;;
  esac
}

install_from_source() {
  log "Building from source..."
  local tmpdir
  tmpdir=$(mktemp -d)
  trap 'rm -rf "$tmpdir"' EXIT
  cd "$tmpdir"
  git clone --depth 1 "https://github.com/${REPO}.git" teynex
  cd teynex
  npm ci --no-audit --no-fund
  npm run build
  npm install -g . --no-audit --no-fund
  ok "Installed globally with npm"
}

install_npm_global() {
  install_from_source
}

ensure_path() {
  case ":$PATH:" in
    *":$INSTALL_DIR:"*) return 0 ;;
    *) warn "$INSTALL_DIR not in PATH";;
  esac
  local shell_rc=""
  case "$(basename "${SHELL:-}")" in
    bash) shell_rc="${HOME}/.bashrc" ;;
    zsh) shell_rc="${HOME}/.zshrc" ;;
    fish) shell_rc="${HOME}/.config/fish/config.fish" ;;
  esac
  if [ -n "$shell_rc" ] && [ -f "$shell_rc" ]; then
    echo "export PATH=\"\$PATH:$INSTALL_DIR\"" >> "$shell_rc"
    ok "Added $INSTALL_DIR to PATH in $shell_rc (restart shell)"
  fi
}

main() {
  echo -e "${BLUE}"
  cat <<'EOF'
  ████████  ██████  ██    ██ ███████ 
     ██    ██    ██ ██    ██ ██      
     ██    ██    ██ ██    ██ █████   
     ██    ██    ██  ██  ██  ██      
     ██     ██████    ████   ███████ 
                                    
  CLI Agent — Installer
EOF
  echo -e "${NC}"

  local os
  os=$(detect_os)
  log "Detected OS: $os"

  install_node "$os"
  install_npm_global
  ensure_path

  echo
  ok "Installation complete!"
  echo -e "Run ${GREEN}teynex${NC} to start."
  echo -e "Or add ${YELLOW}$INSTALL_DIR${NC} to PATH and restart terminal."
}

main "$@"