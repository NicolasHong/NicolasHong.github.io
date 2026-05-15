param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$BundleArgs
)

$ErrorActionPreference = "Stop"
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $RepoRoot

$RubyBin = "D:\Programs\Ruby40-x64\bin"
if (Test-Path $RubyBin) {
  $env:Path = "$RubyBin;$env:Path"
}

$BundleHome = Join-Path $RepoRoot ".bundle"
$BundleGems = Join-Path $BundleHome "gems"
$BundleGemHome = Join-Path $BundleGems "ruby\4.0.0"
$BundleBin = Join-Path $BundleHome "bin"

New-Item -ItemType Directory -Force -Path $BundleHome, $BundleGems, $BundleGemHome, $BundleBin | Out-Null

$env:Path = "$BundleBin;$env:Path"
$env:GEM_HOME = $BundleGemHome
$env:GEM_PATH = $BundleGemHome
$env:BUNDLE_USER_HOME = $BundleHome
$env:BUNDLE_USER_CACHE = Join-Path $BundleHome "cache"
$env:BUNDLE_USER_CONFIG = Join-Path $BundleHome "config"
$env:BUNDLE_SYSTEM_BINDIR = $BundleBin

if (-not $BundleArgs -or $BundleArgs.Count -eq 0) {
  $BundleArgs = @("install")
}

& bundle @BundleArgs
