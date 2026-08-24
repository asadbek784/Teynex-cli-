# Teynex CLI Agent

**Kuchli, autonom va qulay terminal AI yordamchisi** — kod yozish, refactor qilish, testlar yaratish, va loyihalarni boshqarish uchun.

[![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)](https://github.com/asadbek784/Teynex-cli-/releases)
[![Node](https://img.shields.io/badge/node-%3E%3D18-green.svg)](https://nodejs.org)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## 🚀 Tez o'rnatish (Bitta buyruq)

### Linux / macOS / WSL / Ubuntu (Proot-distro)
```bash
curl -fsSL https://raw.githubusercontent.com/asadbek784/Teynex-cli-/main/install.sh | bash
```

### Termux (Android)
```bash
pkg install -y git curl
curl -fsSL https://raw.githubusercontent.com/asadbek784/Teynex-cli-/main/install.sh | bash
```

### Ubuntu ichida (Proot-distro)
```bash
proot-distro install ubuntu
proot-distro login ubuntu
curl -fsSL https://raw.githubusercontent.com/asadbek784/Teynex-cli-/main/install.sh | bash
```

> **Eslatma:** `~/.local/bin` PATHga qo'shilishi kerak. Agar `teynex` topilmasa, terminalni qayta oching yoki:
> ```bash
> export PATH="$PATH:$HOME/.local/bin"
> ```

---

## 📦 Alternativ o'rnatish usullari

### NPM global (Node.js >= 18 kerak)
```bash
npm install -g github:asadbek784/Teynex-cli-
```

### Manual build
```bash
git clone https://github.com/asadbek784/Teynex-cli-.git
cd Teynex-cli-
npm ci && npm run build
cp dist/index.js ~/.local/bin/teynex
chmod +x ~/.local/bin/teynex
```

---

## 🎯 Funksiyalar

| Funksiya | Tavsif |
|----------|--------|
| **Autonom agent** | Vazifani qabul qiladi, fayllarni o'qiydi, o'zgartiradi, testlari ishga tushiradi |
| **Rich terminal UI** | Rangli output, markdown rendering, jadval/blok ko'rinishi |
| **Tool tizimi** | `list_files`, `read_file`, `write_file`, `edit_file`, `search_files`, `run_command`, `git_status`, `git_diff`, `glob_files`, `delete_file` |
| **Xavfsizlik** | Xavfli buyruqlar uchun tasdiqlash so'rovi (approval) |
| **Ko'p model suporti** | OpenRouter, OpenAI, Groq, Gemini, Custom OpenAI-compatible |
| **Konfiguratsiya** | `~/.config/teynex/config.json` da saqlanadi |
| **Tarix va kontekst** | Loyiha kontekstini avtomatik o'qiydi |

---

## ⚙️ Sozlash

Birinchi ishga tushirishda:
```bash
teynex setup
```

Yoki config faylini to'g'ridan-to'g'ri tahrirlash:
```bash
# ~/.config/teynex/config.json
{
  "provider": "openrouter",
  "model": "anthropic/claude-3.5-sonnet",
  "apiKey": "sk-xxxx",
  "maxSteps": 20,
  "baseURL": "https://openrouter.ai/api/v1"
}
```

**Provider variantlari:** `openrouter`, `openai`, `groq`, `gemini`, `custom`

---

## 💡 Ishlatish misollari

```bash
# Oddiy chat
teynex

# Vazifa berish
teynex "Yangi React komponent yarating: Button.tsx"

# Fayl o'qish va o'zgartirish
teynex "@read src/components/Button.tsx"
teynex "@edit src/components/Button.tsx --old 'onClick' --new 'onPress'"

# Qidiruv
teynex "@grep 'TODO' src/"

# Shell buyrug'i
teynex "@bash npm test"
```

**Interaktiv rejimda:**
- `@` bilan boshlangan buyruqlar tool sifatida bajariladi
- `/help` — yordam
- `/config` — sozlamalar
- `exit` / `Ctrl+C` — chiqish

---

## 🔧 Texnologiyalar

- **Runtime:** Node.js 18+ (ESM)
- **UI:** `chalk`, `prompts` — rangli terminal interfeysi
- **AI Client:** OpenAI-compatible API (OpenRouter, Groq, etc.)
- **Tools:** `fs/promises`, `child_process`, `glob` patterns
- **Config:** JSON + YAML support

---

## 📜 Versiya tarixi

| Versiya | Sana | O'zgarishlar |
|---------|------|--------------|
| **2.1.0** | 2026-08-24 | Rich UI (markdown, tables, blocks), yangi tools (`glob_files`, `delete_file`), `install.sh` universal o'rnatuvchi, grep/rg fallback, progress logging |
| **2.0.0** | 2024-08-14 | Asosiy agent arxitekturasi, tool tizimi, multi-provider AI suport, setup wizard |
| **1.0.0** | 2024-01-01 | Birinchi versiya — oddiy chat + fayl operatsiyalari |

---

## 🤝 Hissa qo'shish

```bash
git clone https://github.com/asadbek784/Teynex-cli-.git
cd Teynex-cli-
npm ci
npm run build
# O'zgartirishlar kiritish
git commit -am "feat: yangi funksiya"
git push
```

---

## 📄 Litsenziya

MIT License — bepul foydalanish, o'zgartirish va tarqatish uchun.

---

## 🔗 Havolalar

- **Repo:** https://github.com/asadbek784/Teynex-cli-
- **Issues:** https://github.com/asadbek784/Teynex-cli-/issues
- **Releases:** https://github.com/asadbek784/Teynex-cli-/releases