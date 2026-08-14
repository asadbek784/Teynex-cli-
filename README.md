# Teynex AI

A fast, simple terminal coding agent made for **Termux + Linux**. The interface follows the supplied Teynex screenshot: black terminal, Teynex banner, short commands, and an agent loop that can inspect, edit, and validate a project.


## Ubuntu / Termux proot-distro (recommended)

From Termux:

```bash
proot-distro login ubuntu
```

Inside Ubuntu, clone the GitHub repository and run the included installer:

```bash
apt update && apt install -y git curl ca-certificates
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git ~/teynex-src
cd ~/teynex-src
bash install-ubuntu.sh
```

The installer automatically installs Node.js 22 when needed, builds Teynex, and installs the `teynex` command globally. Full instructions are in `INSTALL-UBUNTU.md`.

After your GitHub repository is public, the shortest remote install is:

```bash
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/install-ubuntu.sh | bash -s -- https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

## Fully automatic Termux → Ubuntu install

After pushing to GitHub, from Termux you can use the helper installer:

```bash
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/install-termux-ubuntu.sh | bash -s -- https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

It installs `proot-distro` if needed, creates Ubuntu, installs Node.js 22, builds Teynex, and installs the `teynex` command inside Ubuntu.

## Install from GitHub

After pushing this repository to GitHub:

```bash
pkg update
pkg install nodejs git
npm install -g git+https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

Then simply:

```bash
teynex
```

The first run opens a tiny setup wizard. Pick a provider, paste the API key, choose a model, and you're ready.

### Update

```bash
npm update -g teynex-ai
```

Or reinstall directly from GitHub:

```bash
npm install -g git+https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

## API setup

Teynex uses OpenAI-compatible `/chat/completions`, so there is no provider SDK to install.

Supported presets:

- **OpenRouter** — `https://openrouter.ai/api/v1`
- **OpenAI** — `https://api.openai.com/v1`
- **Groq** — `https://api.groq.com/openai/v1`
- **Gemini** — `https://generativelanguage.googleapis.com/v1beta/openai`
- **Mistral** — `https://api.mistral.ai/v1`
- **Custom** — any compatible endpoint

You can configure or change it any time:

```bash
teynex setup
```

Check it with:

```bash
teynex config
teynex doctor
```

Environment variables also work, which is useful for CI/VPS:

```bash
export TEYNEX_API_KEY="..."
export TEYNEX_MODEL="..."
export TEYNEX_BASE_URL="https://.../v1"
teynex
```

## Commands

Inside Teynex:

```text
/help
/model <model>
/status
/clear
/exit
```

Terminal commands:

```bash
teynex
teynex --auto
teynex "inspect this project and fix the failing build"
```

`--auto` removes command approval prompts, so use it only in a trusted project.

## What the agent can do

- Read and inspect files
- Search the repository
- Create and edit files
- Run shell commands with an approval gate
- Inspect Git status and diff
- Iterate over multiple tool calls
- Work from the current project directory

## Termux notes

Teynex is intentionally dependency-light. Node.js 20+ and Git are enough to start. `ripgrep` is recommended for fast repository search:

```bash
pkg install ripgrep
```

## Security

The setup wizard stores the API key in `~/.config/teynex/config.json` with restrictive permissions. Do not commit that file. API keys are never written into the project by Teynex.
