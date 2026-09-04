# TYNEX CLI

TYNEX CLI is a terminal-native autonomous coding agent designed for repository exploration, task planning, safe file editing, and command execution.

## Features

- Project discovery for Git and common stacks
- Safe filesystem and shell tools
- Planner and execution loop
- Session persistence and config storage
- Doctor checks for runtime and environment health
- Non-interactive and interactive modes

## Quick start

```bash
npm install
npm run build
node dist/cli.js --help
```

## Commands

```bash
tynex --prompt "fix the issue in this repository"
tynex doctor
tynex config
tynex resume
```

## Security

- Dangerous commands are blocked unless explicitly approved
- Secrets are never printed in logs
- Filesystem writes are limited to the current working directory

## License

MIT
