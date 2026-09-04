# Push Teynex to GitHub

```bash
git init
git add .
git commit -m "Initial Teynex AI agent"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## Install in Termux Ubuntu

```bash
proot-distro login ubuntu
```

Then inside Ubuntu:

```bash
apt update && apt install -y git curl ca-certificates
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git ~/teynex-src
cd ~/teynex-src
bash install-ubuntu.sh
teynex
```

## One command

After replacing `YOUR_USERNAME` and `YOUR_REPO`:

```bash
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/install-ubuntu.sh | bash -s -- https://github.com/YOUR_USERNAME/YOUR_REPO.git
```
