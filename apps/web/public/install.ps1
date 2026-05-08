# RulesHub CLI installer (Windows)
#
#   iwr -useb https://ruleshub.dev/install.ps1 | iex
#
# Optional environment overrides (set before piping):
#   $env:RULESHUB_VERSION       — install a specific version (default: latest)
#   $env:RULESHUB_INSTALL_DIR   — install location (default: $env:LOCALAPPDATA\Programs\ruleshub)
#   $env:RULESHUB_REPO          — source repo (default: lozymon/ruleshub)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$Repo       = if ($env:RULESHUB_REPO)        { $env:RULESHUB_REPO }        else { 'lozymon/ruleshub' }
$InstallDir = if ($env:RULESHUB_INSTALL_DIR) { $env:RULESHUB_INSTALL_DIR } else { Join-Path $env:LOCALAPPDATA 'Programs\ruleshub' }
$Version    = $env:RULESHUB_VERSION

function Fail([string] $msg) {
    Write-Error "error: $msg"
    exit 1
}

function Get-Target {
    $arch = $env:PROCESSOR_ARCHITECTURE
    switch ($arch) {
        'AMD64' { return 'x86_64-pc-windows-msvc' }
        'ARM64' {
            Write-Warning "no native ARM64 build yet — falling back to x86_64 (will run via emulation)"
            return 'x86_64-pc-windows-msvc'
        }
        default { Fail "unsupported architecture: $arch" }
    }
}

function Get-LatestVersion {
    Write-Host "fetching latest release tag from $Repo..."
    $api = "https://api.github.com/repos/$Repo/releases/latest"
    $resp = Invoke-RestMethod -Uri $api -Headers @{ 'User-Agent' = 'ruleshub-installer' }
    $tag = $resp.tag_name
    if (-not $tag) { Fail "could not determine latest release tag" }
    return $tag -replace '^cli-v',''
}

function Verify-Sha256([string] $file, [string] $expected) {
    $actual = (Get-FileHash -Algorithm SHA256 -Path $file).Hash.ToLower()
    if ($actual -ne $expected.ToLower()) {
        Fail "checksum mismatch for $(Split-Path $file -Leaf)"
    }
}

$target = Get-Target
if (-not $Version) { $Version = Get-LatestVersion }

$archive   = "ruleshub-$Version-$target.zip"
$base      = "https://github.com/$Repo/releases/download/cli-v$Version"
$archiveUrl = "$base/$archive"
$sumsUrl    = "$base/SHA256SUMS"

Write-Host "installing ruleshub v$Version for $target..."

$tmp = New-Item -ItemType Directory -Path (Join-Path ([System.IO.Path]::GetTempPath()) ([System.Guid]::NewGuid()))
try {
    $archivePath = Join-Path $tmp $archive
    Write-Host "downloading $archiveUrl"
    Invoke-WebRequest -Uri $archiveUrl -OutFile $archivePath -UseBasicParsing

    Write-Host "verifying checksum..."
    $sumsPath = Join-Path $tmp 'SHA256SUMS'
    Invoke-WebRequest -Uri $sumsUrl -OutFile $sumsPath -UseBasicParsing

    $expected = (Get-Content $sumsPath | Where-Object { $_ -match "  $([regex]::Escape($archive))$" } | Select-Object -First 1) -split '\s+' | Select-Object -First 1
    if (-not $expected) { Fail "no checksum found for $archive in SHA256SUMS" }
    Verify-Sha256 $archivePath $expected

    Write-Host "extracting..."
    Expand-Archive -Path $archivePath -DestinationPath $tmp -Force

    if (-not (Test-Path $InstallDir)) { New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null }
    $extracted = Join-Path $tmp "ruleshub-$Version-$target"
    Copy-Item -Path (Join-Path $extracted 'ruleshub.exe') -Destination (Join-Path $InstallDir 'ruleshub.exe') -Force

    Write-Host ""
    Write-Host "ok: ruleshub v$Version installed to $InstallDir\ruleshub.exe"

    $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
    if ($userPath -notlike "*$InstallDir*") {
        Write-Host ""
        Write-Host "warning: $InstallDir is not in your User PATH"
        Write-Host "to add it permanently, run (in a new shell):"
        Write-Host "  [Environment]::SetEnvironmentVariable('Path', `"`$([Environment]::GetEnvironmentVariable('Path','User'));$InstallDir`", 'User')"
    }
}
finally {
    Remove-Item -Recurse -Force $tmp
}
