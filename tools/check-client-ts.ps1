Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$output = npx tsc -p FATCATUI/tsconfig.json --noEmit --ignoreDeprecations 6.0 2>&1 |
    Select-String -Pattern "BottomNavUI|GeneratedUiAssets|CatDetailPanel|CatManager|SaveManager|ConfigManager|SaveData|ItemModel"

if ($output) {
    $output
    exit 1
}

Write-Host "No TypeScript diagnostics matched client UI/data pipeline files."
