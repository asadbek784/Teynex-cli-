# Changelog

All notable changes to Teynex CLI Agent will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2026-08-24

### Added
- **Rich Terminal UI**: Markdown rendering (headers, code blocks, inline code, blockquotes, lists)
- **Table output**: `PrintTable` method for structured data display
- **Code blocks with line numbers**: Syntax-highlighted code display
- **Spinner/progress indicators**: Visual feedback during long operations
- **Help system**: Built-in `/help` command with keyboard shortcuts
- **New tools**: `glob_files` (glob pattern matching), `delete_file` (file/directory removal)
- **Universal installer**: `install.sh` — works on Termux, Ubuntu, Debian, Arch, Fedora, Alpine, macOS, WSL
- **grep/rg fallback**: `search_files` uses ripgrep if available, falls back to grep
- **Progress logging**: Timestamped step-by-step logging with colors (yellow=thinking, blue=tool call, green=done, red=error)

### Changed
- **Agent logic**: Improved tool calling loop, better error handling, step callbacks
- **Tool definitions**: Added `glob_files` and `delete_file` to tool schema
- **README**: Complete rewrite with installation guides, feature table, version history
- **Package version**: Bumped to 2.1.0

### Fixed
- **Path safety**: Improved `safePath` validation
- **Command approval**: Better UX for destructive command confirmation

## [2.0.0] - 2024-08-14

### Added
- **Autonomous agent architecture**: Multi-step reasoning with tool calls
- **Tool system**: list_files, read_file, write_file, edit_file, search_files, run_command, git_status, git_diff
- **Multi-provider AI support**: OpenRouter, OpenAI, Groq, Gemini, Custom OpenAI-compatible
- **Setup wizard**: Interactive `teynex setup` for configuration
- **Config persistence**: JSON config at `~/.config/teynex/config.json`
- **Project context awareness**: Auto-detects project structure
- **TypeScript/ESM**: Modern Node.js stack with strict typing

### Changed
- Complete rewrite from v1 (Python/Go prototype) to TypeScript/Node.js

## [1.0.0] - 2024-01-01

### Added
- Initial prototype: Basic chat + file operations
- Simple tool calling protocol
- Local-first design

---

## Versioning Scheme

- **Major** (x.0.0): Breaking changes to CLI interface, config format, or tool protocol
- **Minor** (x.y.0): New features, tools, UI improvements (backward compatible)
- **Patch** (x.y.z): Bug fixes, minor improvements

## Release Process

```bash
# 1. Update version in package.json
npm version minor  # or major/patch

# 2. Update CHANGELOG.md

# 3. Build and test
npm run build

# 4. Commit and tag
git add -A
git commit -m "chore: release vX.Y.Z"
git tag vX.Y.Z
git push origin main --tags

# 5. GitHub Release created automatically via tags
```