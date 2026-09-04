#!/usr/bin/env bash
set -euo pipefail

BIN_NAME="teynex"
INSTALL_DIR="${HOME}/.local/bin"
CONFIG_DIR="${HOME}/.config/teynex"
NPM_PKG="teynex-ai"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[teynex]${NC} $*"; }
ok() { echo -e "${GREEN}[✓]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }
err() { echo -e "${RED}[✗]${NC} $*"; }

remove_binary() {
  local found=0
  if [ -f "$INSTALL_DIR/$BIN_NAME" ]; then
    rm -f "$INSTALL_DIR/$BIN_NAME"
    ok "Removed $INSTALL_DIR/$BIN_NAME"
    found=1
  fi
  if command -v "$BIN_NAME" >/dev/null 2>&1; then
    local which_bin
    which_bin=$(command -v "$BIN_NAME")
    if [ "$which_bin" != "$INSTALL_DIR/$BIN_NAME" ]; then
      warn "Found $BIN_NAME at $which_bin (not managed by this installer)"
    fi
  fi
  return $found
}

remove_npm_global() {
  if command -v npm >/dev/null 2>&1; then
    if npm list -g "$NPM_PKG" >/dev/null 2>&1; then
      log "Removing npm global package: $NPM_PKG"
      npm uninstall -g "$NPM_PKG" && ok "npm package removed"
    else
      log "npm package $NPM_PKG not found globally"
    fi
  fi
}

remove_config() {
  if [ -d "$CONFIG_DIR" ]; then
    echo
    read -rp "Remove config directory $CONFIG_DIR? [y/N] " -n 1
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      rm -rf "$CONFIG_DIR"
      ok "Config removed"
    else
      log "Config kept at $CONFIG_DIR"
    fi
  fi
}

remove_shell_rc() {
  local shell_rc=""
  case "$(basename "${SHELL:-}")" in
    bash) shell_rc="${HOME}/.bashrc" ;;
    zsh) shell_rc="${HOME}/.zshrc" ;;
    fish) shell_rc="${HOME}/.config/fish/config.fish" ;;
  esac
  if [ -n "$shell_rc" ] && [ -f "$shell_rc" ]; then
    if grep -q "$INSTALL_DIR" "$shell_rc"; then
      echo
      read -rp "Remove PATH entry from $shell_rc? [y/N] " -n 1
      echo
      if [[ $REPLY =~ ^[Yy]$ ]]; then
        sed -i "\|$INSTALL_DIR|d" "$shell_rc"
        ok "PATH entry removed from $shell_rc"
      fi
    fi
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
                                    
  CLI Agent — Uninstaller
EOF
  echo -e "${NC}"

  log "Checking installations..."

  remove_binary
  remove_npm_global
  remove_config
  remove_shell_rc

  echo
  ok "Uninstall complete!"
  echo -e "If ${YELLOW}teynex${NC} still runs, restart your terminal or check PATH."
}

main "$@"