# 批量无头截图：pwsh -NoProfile -File tools/shots.ps1 [筛选关键字] [路由配置文件名]
# 默认读取 tools/routes.json，用 Edge 无头模式逐条截图到 dev/shots/
param([string]$Filter = "", [string]$Routes = "routes.json")

$ErrorActionPreference = "Continue"
$root = Split-Path -Parent $PSScriptRoot
$cfg = Get-Content (Join-Path $PSScriptRoot $Routes) -Raw -Encoding UTF8 | ConvertFrom-Json
$outDir = Join-Path $root $cfg.outDir
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$candidates = @(
  "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
  "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
  "C:\Program Files\Google\Chrome\Application\chrome.exe",
  "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
)
$exe = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $exe) { Write-Error "no browser found"; exit 1 }

$profile = Join-Path $env:TEMP ("dsh-shots-" + [guid]::NewGuid().ToString("N").Substring(0, 8))

foreach ($s in $cfg.shots) {
  if ($Filter -and $s.name -notlike "*$Filter*") { continue }
  $out = Join-Path $outDir ($s.name + ".png")
  if (Test-Path $out) { Remove-Item $out -Force }
  $url = $cfg.base + $s.url
  $w = if ($s.w) { $s.w } else { 390 }
  $h = if ($s.h) { $s.h } else { 844 }
  $wait = if ($s.wait) { $s.wait } else { 4200 }
  $dsf = if ($s.dsf) { $s.dsf } else { 2 }
  & $exe --headless=new --disable-gpu --no-sandbox --disable-extensions --hide-scrollbars `
    --force-device-scale-factor=$dsf --window-size="$w,$h" --virtual-time-budget=$wait `
    --user-data-dir="$profile" --screenshot="$out" "$url" 2>$null | Out-Null
  Start-Sleep -Milliseconds 400
  if (Test-Path $out) { Write-Output ("OK   {0,-16} {1}" -f $s.name, (Get-Item $out).Length) }
  else { Write-Output ("FAIL {0}" -f $s.name) }
}
Remove-Item $profile -Recurse -Force -ErrorAction SilentlyContinue
Write-Output "done"
