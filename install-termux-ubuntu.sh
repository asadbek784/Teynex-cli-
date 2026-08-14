#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

# Teynex AI — Termux host installer for proot-distro Ubuntu
# Usage from Termux:
#   bash install-termux-ubuntu.sh https://github.com/USER/REPO.git

REPO_URL="${1:-${TEYNEX_REPO_URL:-}}"
[[ -n "$REPO_URL" ]] || { echo "Usage: bash install-termux-ubuntu.sh https://github.com/USER/REPO.git"; exit 2; }

say() { printf '\033[1;37m[TEYNEX]\033[0m %s\n' "$*"; }

command -v pkg >/dev/null 2>&1 || { echo 'Run this script in Termux.'; exit 1; }

say "Installing Termux prerequisites..."
pkg update -y
pkg install -y proot-distro

if ! proot-distro list 2>/dev/null | grep -qE '^ubuntu([[:space:]]|$)|\bubuntu\b.*installed'; then
  say "Installing Ubuntu in proot-distro..."
  proot-distro install ubuntu
fi

say "Starting Ubuntu installer..."
proot-distro login ubuntu -- bash -lc "apt-get update -y && DEBIAN_FRONTEND=noninteractive apt-get install -y ca-certificates curl git && tmp=\$(mktemp -d) && cd \"\$tmp\" && git clone --depth 1 '$REPO_URL' teynex-src && cd teynex-src && bash install-ubuntu.sh '$REPO_URL'"

echo
say "Done. Start Teynex with:"
echo "  proot-distro login ubuntu"
echo "  teynex"
