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

Invoke-Step "DOM canvas mode contract check" {
    node .\tools\check-dom-canvas-mode-contract.js
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

Invoke-Step "Main UI art contract check" {
    node .\tools\check-main-ui-art.js
}

Invoke-Step "Feature panel presentation contract check" {
    node .\tools\check-feature-panel-presentation-contract.js
}

Invoke-Step "Feature page hierarchy contract check" {
    node .\tools\check-feature-page-hierarchy-contract.js
}

Invoke-Step "Research tree contract check" {
    node .\tools\check-research-tree-contract.js
}

Invoke-Step "Shop product art contract check" {
    node .\tools\check-shop-product-art.js
}

Invoke-Step "Shop interaction contract check" {
    node .\tools\check-shop-interaction.js
}

Invoke-Step "Building room art contract check" {
    node .\tools\check-building-room-art.js
}

Invoke-Step "Factory appearance art contract check" {
    node .\tools\check-factory-appearance-art.js
}

Invoke-Step "Inventory and research art contract check" {
    node .\tools\check-inventory-research-art.js
}

Invoke-Step "Cat presentation contract check" {
    node .\tools\check-cat-presentation-contract.js
}

Invoke-Step "Cat overlay presentation contract check" {
    node .\tools\check-cat-overlay-presentation-contract.js
}

Invoke-Step "Cat skin art contract check" {
    node .\tools\check-cat-skin-art.js
}

Invoke-Step "Cat equipment art contract check" {
    node .\tools\check-cat-equipment-art.js
}

Invoke-Step "Cat skin sync contract check" {
    node .\tools\check-cat-skin-sync-contract.js
}

Invoke-Step "Cat skin acquisition contract check" {
    node .\tools\check-cat-skin-acquisition-contract.js
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
    node .\tools\check-friend-factory-art.js
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

Invoke-Step "Decor shop contract check" {
    node .\tools\check-decor-shop-contract.js
}

Invoke-Step "Decor collection contract check" {
    node .\tools\check-decor-collection-contract.js
}

Invoke-Step "Social realtime contract check" {
    node .\tools\check-social-realtime-contract.js
}

Invoke-Step "Friend help contract check" {
    node .\tools\check-friend-help-contract.js
}

Invoke-Step "Friend boost history contract check" {
    node .\tools\check-friend-boost-history-contract.js
}

Invoke-Step "Friend cooperative goal contract check" {
    node .\tools\check-friend-coop-goal-contract.js
}

Invoke-Step "Daily order contract check" {
    node .\tools\check-daily-order-contract.js
}

Invoke-Step "Player authentication contract check" {
    node .\tools\check-player-auth-contract.js
}

Invoke-Step "Server status contract check" {
    node .\tools\check-server-status-contract.js
}

Invoke-Step "Settings server status contract check" {
    node .\tools\check-settings-server-status-contract.js
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

Invoke-Step "Friend social cards contract check" {
    node .\tools\check-friend-social-cards-contract.js
}

Invoke-Step "Friend cooperation cards contract check" {
    node .\tools\check-friend-cooperation-cards-contract.js
}

Invoke-Step "Leaderboard contract check" {
    node .\tools\check-leaderboard-contract.js
}

Invoke-Step "Server unit and API tests" {
    dotnet test .\FATCATServer\FATCATServer.sln --no-restore
}

Write-Host ""
Write-Host "Quick verification passed."
