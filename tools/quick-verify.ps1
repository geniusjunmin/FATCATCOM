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
    $global:LASTEXITCODE = 0
    & $Command
    if ($LASTEXITCODE -ne 0) {
        throw "$Name failed with exit code $LASTEXITCODE."
    }
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

Invoke-Step "DOM asset resolver contract check" {
    node .\tools\check-dom-asset-resolver-contract.js
}

Invoke-Step "DOM formatter contract check" {
    node .\tools\check-dom-formatters-contract.js
}

Invoke-Step "Main panel config contract check" {
    node .\tools\check-main-panel-config-contract.js
}

Invoke-Step "UI presentation contract check" {
    node .\tools\check-ui-presentation-contract.js
}

Invoke-Step "Factory presentation contract check" {
    node .\tools\check-factory-presentation-contract.js
}

Invoke-Step "Factory overlay presentation contract check" {
    node .\tools\check-factory-overlay-presentation-contract.js
}

Invoke-Step "Feature panel presentation contract check" {
    node .\tools\check-feature-panel-presentation-contract.js
}

Invoke-Step "Cat presentation contract check" {
    node .\tools\check-cat-presentation-contract.js
}

Invoke-Step "Cat overlay presentation contract check" {
    node .\tools\check-cat-overlay-presentation-contract.js
}

Invoke-Step "HUD presentation contract check" {
    node .\tools\check-hud-presentation-contract.js
}

Invoke-Step "Nav presentation contract check" {
    node .\tools\check-nav-presentation-contract.js
}

Invoke-Step "Panel presentation contract check" {
    node .\tools\check-panel-presentation-contract.js
}

Invoke-Step "Shop state contract check" {
    node .\tools\check-shop-state-contract.js
}

Invoke-Step "Friend sync contract check" {
    node .\tools\check-friend-sync-contract.js
}

Invoke-Step "Friend visit-scene contract check" {
    node .\tools\check-friend-visit-scene-contract.js
}

Invoke-Step "Real friend contract check" {
    node .\tools\check-real-friend-contract.js
}

Invoke-Step "Friend presence contract check" {
    node .\tools\check-friend-presence-contract.js
}

Invoke-Step "Friend decor contract check" {
    node .\tools\check-friend-decor-contract.js
}

Invoke-Step "Friend activity contract check" {
    node .\tools\check-friend-activity-contract.js
}

Invoke-Step "Friend reward contract check" {
    node .\tools\check-friend-reward-contract.js
}

Invoke-Step "Friend invite contract check" {
    node .\tools\check-friend-invite-contract.js
}

Invoke-Step "Friend request contract check" {
    node .\tools\check-friend-request-contract.js
}

Invoke-Step "Leaderboard contract check" {
    node .\tools\check-leaderboard-contract.js
}

Invoke-Step "Server unit and API tests" {
    dotnet test .\FATCATServer\FATCATServer.sln --no-restore
}

Write-Host ""
Write-Host "Quick verification passed."
