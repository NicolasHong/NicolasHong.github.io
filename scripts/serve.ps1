param(
  [string]$HostAddress = "127.0.0.1",
  [int]$Port = 4000,
  [switch]$NoWatch
)

$ErrorActionPreference = "Stop"
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $RepoRoot

$RubyBin = "D:\Programs\Ruby40-x64\bin"
if (Test-Path $RubyBin) {
  $env:Path = "$RubyBin;$env:Path"
}

$BundleHome = Resolve-Path ".\.bundle"
$GemHome = Resolve-Path ".\.bundle\gems\ruby\4.0.0"
$BundleBin = Resolve-Path ".\.bundle\bin"

$env:Path = "$BundleBin;$env:Path"
$env:GEM_HOME = $GemHome
$env:GEM_PATH = $GemHome
$env:BUNDLE_USER_HOME = $BundleHome
$env:BUNDLE_USER_CACHE = Join-Path $BundleHome "cache"
$env:BUNDLE_USER_CONFIG = Join-Path $BundleHome "config"
$env:BUNDLE_SYSTEM_BINDIR = $BundleBin

$Jekyll = Join-Path $BundleBin "jekyll.bat"
if (-not (Test-Path $Jekyll)) {
  throw "Jekyll executable was not found at $Jekyll. Run bundle install first."
}

$JekyllArgs = @("serve", "--host", $HostAddress, "--port", "$Port")
if ($NoWatch) {
  $JekyllArgs += "--no-watch"
}

& $Jekyll @JekyllArgs
