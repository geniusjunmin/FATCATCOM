Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function Invoke-Step {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name,
        [Parameter(Mandatory = $true)]
        [scriptblock]$Command
    )

    Write-Host ""
    Write-Host "== $Name =="
    & $Command
}

Invoke-Step "Client TypeScript focused check" {
    powershell -ExecutionPolicy Bypass -File .\tools\check-client-ts.ps1
}

Invoke-Step "Generated server balance is current" {
    node .\tools\generate-server-balance.js --check
}

Invoke-Step "Client/server balance drift check" {
    node .\tools\check-balance-config-drift.js
}

Invoke-Step "Client/server effect coverage check" {
    node .\tools\check-balance-effect-coverage.js
}

Invoke-Step "Client catalog metadata consumption check" {
    node .\tools\check-client-catalog-metadata-consumption.js
}

Invoke-Step "Shop state contract check" {
    node .\tools\check-shop-state-contract.js
}

Invoke-Step "Friend sync contract check" {
    node .\tools\check-friend-sync-contract.js
}

Invoke-Step "Real friend contract check" {
    node .\tools\check-real-friend-contract.js
}

Invoke-Step "Leaderboard contract check" {
    node .\tools\check-leaderboard-contract.js
}

Invoke-Step "Server unit and API tests" {
    dotnet test .\FATCATServer\FATCATServer.sln --no-restore
}

Write-Host ""
Write-Host "Quick verification passed."
