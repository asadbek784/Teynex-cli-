# Teynex AI — Ubuntu / proot-distro install

Teynex is designed to run cleanly inside Termux's `proot-distro` Ubuntu.

## 1. Enter Ubuntu

From Termux:

```bash
proot-distro login ubuntu
```

## 2. Install from a cloned GitHub repository

Inside Ubuntu:

```bash
apt update && apt install -y git curl ca-certificates
 git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git ~/teynex-src
cd ~/teynex-src
bash install-ubuntu.sh
```

The installer automatically:

- installs Node.js 22 with nvm when Node 20+ is missing;
- installs build tools;
- clones/updates Teynex into `~/.local/share/teynex-ai`;
- runs `npm install` and `npm run build`;
- installs the `teynex` command globally for the current Ubuntu user.

## 3. Start

```bash
teynex
```

First run:

```bash
teynex setup
```

Then choose a provider, paste the API key, and enter the model.

## One-command remote installer

After you push this repository to GitHub, replace the two placeholders in this command:

```bash
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/install-ubuntu.sh | bash -s -- https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

Run it from inside Ubuntu. This is the shortest supported installation path.

## Termux → Ubuntu shortcut

From Termux, the same installer can be run without manually opening a shell first:

```bash
proot-distro login ubuntu -- bash -lc 'curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/install-ubuntu.sh | bash -s -- https://github.com/YOUR_USERNAME/YOUR_REPO.git'
```

## Updating

Inside Ubuntu:

```bash
cd ~/.local/share/teynex-ai
git pull --ff-only
npm install --no-audit --no-fund
npm run build
npm install -g . --no-audit --no-fund
```

## API configuration

```bash
teynex setup
teynex config
teynex doctor
```

Configuration is stored in:

```text
~/.config/teynex/config.json
```

Your API key is not stored in the project repository.

## Install directly from Termux

If you want Termux to install Ubuntu and then Teynex automatically, use the helper script from this repository:

```bash
bash install-termux-ubuntu.sh https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

After publishing the repository, it can also be fetched directly from GitHub:

```bash
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/install-termux-ubuntu.sh | bash -s -- https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

This handles `proot-distro`, Ubuntu, Node.js, dependencies, build, and the global `teynex` command.
