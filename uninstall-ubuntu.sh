#!/usr/bin/env bash
set -euo pipefail
npm uninstall -g teynex-ai 2>/dev/null || true
rm -rf "${TEYNEX_INSTALL_DIR:-$HOME/.local/share/teynex-ai}"
printf 'Teynex removed. Config was kept at ~/.config/teynex\n'
