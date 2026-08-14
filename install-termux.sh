#!/data/data/com.termux/files/usr/bin/bash
set -e
pkg update -y
pkg install -y proot-distro
proot-distro install ubuntu 2>/dev/null || true
proot-distro login ubuntu -- bash -lc 'apt-get update -y && apt-get install -y curl && curl -fsSL https://raw.githubusercontent.com/asadbek784/Teynex-cli-/main/install-ubuntu.sh | bash'
echo "✓ Done. Run: proot-distro login ubuntu -- teynex"
