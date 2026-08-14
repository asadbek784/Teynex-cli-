# Teynex on Termux

## 1. Install prerequisites

```bash
pkg update
pkg upgrade
pkg install nodejs git ripgrep
```

Check:

```bash
node -v
git --version
```

Node.js 20+ is recommended.

## 2. Install Teynex from your GitHub repository

Push this project to GitHub, then install it globally:

```bash
npm install -g git+https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

You can also clone and install locally:

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
npm install
npm run build
npm install -g .
```

## 3. First run

```bash
teynex
```

Teynex automatically opens setup when no API key is configured.

Or run setup directly:

```bash
teynex setup
```

## 4. Daily use

```bash
cd ~/my-project
teynex
```

Then type a task such as:

```text
Build a PHP login page with validation, inspect the existing project first, then test it.
```

## 5. Autonomous mode

```bash
teynex --auto
```

Use this only in a project you trust because it allows the agent to execute commands without asking each time.

## 6. Troubleshooting

```bash
teynex doctor
teynex config
npm prefix -g
which teynex
```

If `teynex` is not found after a global install, restart the Termux shell and check that the global npm bin directory is in `$PATH`.
