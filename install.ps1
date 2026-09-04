$ErrorActionPreference = "Stop"

$repo = "https://github.com/asadbek784/Teynex-cli-.git"
$temp = Join-Path ([System.IO.Path]::GetTempPath()) ("tynex-" + [guid]::NewGuid().ToString("N"))

function Require-Command($name, $installHint) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "$name topilmadi. Avval $installHint o'rnating."
  }
}

try {
  Require-Command "git" "Git (https://git-scm.com/download/win)"
  Require-Command "node" "Node.js 20+ (https://nodejs.org)"
  Require-Command "npm" "Node.js"

  New-Item -ItemType Directory -Path $temp | Out-Null
  git clone --depth 1 $repo (Join-Path $temp "repo")
  Set-Location (Join-Path $temp "repo")
  npm ci --no-audit --no-fund
  npm run build
  npm install -g . --no-audit --no-fund

  Write-Host "TYNEX CLI muvaffaqiyatli o'rnatildi." -ForegroundColor Green
  Write-Host "Ishga tushirish: tynex"
  tynex --help
}
finally {
  if (Test-Path $temp) {
    Remove-Item -Recurse -Force $temp
  }
}
