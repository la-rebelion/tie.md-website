param(
    [string]$Version = $env:TIE_VERSION,
    [string]$InstallDirectory = $env:TIE_INSTALL_DIR
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

if ([string]::IsNullOrWhiteSpace($Version)) {
    $Version = "v0.1.0"
}
if ($Version -notmatch '^v\d+\.\d+\.\d+$') {
    throw "tie.md installer: invalid version '$Version' (expected vMAJOR.MINOR.PATCH)"
}
if ([string]::IsNullOrWhiteSpace($InstallDirectory)) {
    $InstallDirectory = Join-Path $env:LOCALAPPDATA "Programs\tie.md\bin"
}

$Architecture = [System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture.ToString()
if ($Architecture -ne "X64") {
    throw "tie.md installer: Windows $Architecture is not supported by v0.1.0"
}

$Repository = "la-rebelion/tie.md"
$Asset = "tie-$Version-windows-x64.exe"
$BaseUrl = "https://github.com/$Repository/releases/download/$Version"
$TempDirectory = Join-Path ([System.IO.Path]::GetTempPath()) ("tie-install-" + [System.Guid]::NewGuid())

try {
    New-Item -ItemType Directory -Path $TempDirectory | Out-Null
    $DownloadPath = Join-Path $TempDirectory $Asset
    $ChecksumsPath = Join-Path $TempDirectory "SHA256SUMS"

    Write-Host "Installing tie.md $Version for windows-x64"
    try {
        Invoke-WebRequest -Uri "$BaseUrl/$Asset" -OutFile $DownloadPath -UseBasicParsing
        Invoke-WebRequest -Uri "$BaseUrl/SHA256SUMS" -OutFile $ChecksumsPath -UseBasicParsing
    } catch {
        throw "tie.md installer: download failed. Check https://github.com/$Repository/releases/tag/$Version"
    }

    $ChecksumLine = Get-Content $ChecksumsPath | Where-Object {
        $_ -match "\s(?:artifacts/)?$([Regex]::Escape($Asset))$"
    } | Select-Object -First 1
    if (-not $ChecksumLine) {
        throw "tie.md installer: SHA256SUMS does not contain $Asset"
    }
    $Expected = ($ChecksumLine -split '\s+')[0].ToLowerInvariant()
    $Actual = (Get-FileHash -Algorithm SHA256 -Path $DownloadPath).Hash.ToLowerInvariant()
    if ($Expected -ne $Actual) {
        throw "tie.md installer: checksum verification failed. Expected $Expected, got $Actual"
    }

    New-Item -ItemType Directory -Path $InstallDirectory -Force | Out-Null
    $Destination = Join-Path $InstallDirectory "tie.exe"
    Move-Item -Path $DownloadPath -Destination $Destination -Force

    $UserPath = [Environment]::GetEnvironmentVariable("Path", "User")
    $PathEntries = @($UserPath -split ';' | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
    if ($PathEntries -notcontains $InstallDirectory) {
        $UpdatedPath = (@($PathEntries) + $InstallDirectory) -join ';'
        [Environment]::SetEnvironmentVariable("Path", $UpdatedPath, "User")
        $env:Path = "$env:Path;$InstallDirectory"
        Write-Host "Added $InstallDirectory to your user PATH. New terminals will pick it up."
    }

    Write-Host "Verified SHA-256 and installed tie to $Destination"
    & $Destination --version
} finally {
    if (Test-Path $TempDirectory) {
        Remove-Item -Path $TempDirectory -Recurse -Force -ErrorAction SilentlyContinue
    }
}
