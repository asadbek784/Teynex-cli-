# Teynex AI 2.0
## Termux + Ubuntu one-command install
In Termux:
```bash
bash install-termux.sh
```
Or manually:
```bash
pkg install -y proot-distro
proot-distro install ubuntu
proot-distro login ubuntu
curl -fsSL https://raw.githubusercontent.com/asadbek784/Teynex-cli-/main/install-ubuntu.sh | bash
teynex
```
## API
```bash
teynex setup
```
Select OpenRouter, OpenAI, Groq, Gemini, or Custom OpenAI-compatible. Paste key and model. Config is saved at `~/.config/teynex/config.json`.
