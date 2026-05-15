param()

$ErrorActionPreference = "Stop"
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $RepoRoot

$env:UV_CACHE_DIR = Join-Path $RepoRoot "local\uv-cache"

uv run --with geopy --with python-frontmatter --with getorg python scripts/talkmap.py
