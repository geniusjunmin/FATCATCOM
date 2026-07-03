param(
    [string]$ApiBaseUrl = "http://localhost:5144",
    [string]$Origin = "http://localhost:7456"
)

$ErrorActionPreference = "Stop"

function Read-Json($Response) {
    return $Response.Content | ConvertFrom-Json
}

$health = Invoke-WebRequest -Uri "$ApiBaseUrl/health" -UseBasicParsing
if ($health.StatusCode -ne 200) {
    throw "Health check failed with status $($health.StatusCode)."
}

$bootstrap = Invoke-WebRequest -Uri "$ApiBaseUrl/api/config/bootstrap" -Headers @{ Origin = $Origin } -UseBasicParsing
if ($bootstrap.StatusCode -ne 200) {
    throw "Bootstrap check failed with status $($bootstrap.StatusCode)."
}

$corsOrigin = $bootstrap.Headers["Access-Control-Allow-Origin"]
if ($corsOrigin -ne $Origin) {
    throw "CORS origin mismatch. Expected '$Origin', got '$corsOrigin'."
}

$deviceId = "smoke-$([Guid]::NewGuid().ToString('N'))"
$auth = Invoke-WebRequest `
    -Uri "$ApiBaseUrl/api/auth/guest" `
    -Method Post `
    -ContentType "application/json" `
    -Body (@{ deviceId = $deviceId; companyName = "FatCat Smoke" } | ConvertTo-Json) `
    -UseBasicParsing

$authData = Read-Json $auth
$playerId = $authData.data.playerId
if ([string]::IsNullOrWhiteSpace($playerId)) {
    throw "Guest auth did not return playerId."
}

$mail = Read-Json (Invoke-WebRequest -Uri "$ApiBaseUrl/api/mail?playerId=$playerId" -UseBasicParsing)
$friends = Read-Json (Invoke-WebRequest -Uri "$ApiBaseUrl/api/friends?playerId=$playerId" -UseBasicParsing)
$settings = Read-Json (Invoke-WebRequest -Uri "$ApiBaseUrl/api/settings?playerId=$playerId" -UseBasicParsing)
$initialResources = Read-Json (Invoke-WebRequest -Uri "$ApiBaseUrl/api/resources?playerId=$playerId" -UseBasicParsing)
$buildingSnapshot = Read-Json (Invoke-WebRequest -Uri "$ApiBaseUrl/api/buildings?playerId=$playerId" -UseBasicParsing)
$buildingRows = @($buildingSnapshot.data)
$buildingCafe = $buildingRows | Where-Object { $_.buildingId -eq "building_cafe_1f" } | Select-Object -First 1
if (-not $buildingCafe -or [int]$buildingCafe.level -ne 6) {
    throw "Building snapshot cafe level mismatch."
}
$production = Read-Json (Invoke-WebRequest `
    -Uri "$ApiBaseUrl/api/production/preview" `
    -Method Post `
    -ContentType "application/json" `
    -Body (@{
        grossCoinPerSecond = 213
        wageCostPerSecond = 0.25
        beanCostPerSecond = 4
        buildings = @(@{
            buildingId = "building_cafe_1f"
            grossCoinPerSecond = 213
            wageCostPerSecond = 0.25
            netCoinPerSecond = 0
            beanCostPerSecond = 4
        })
    } | ConvertTo-Json -Depth 5) `
    -UseBasicParsing)

if ([Math]::Abs([double]$production.data.netCoinPerSecond - 212.75) -gt 0.0001) {
    throw "Production preview net income mismatch."
}

$serverProduction = Read-Json (Invoke-WebRequest -Uri "$ApiBaseUrl/api/production/server-preview?playerId=$playerId" -UseBasicParsing)
$serverProductionCafe = @($serverProduction.data.buildings) | Where-Object { $_.buildingId -eq "building_cafe_1f" } | Select-Object -First 1
if (-not $serverProductionCafe) {
    throw "Server production preview missing cafe building."
}
if ([Math]::Abs([double]$serverProduction.data.grossCoinPerSecond - 224.357364) -gt 0.0001) {
    throw "Server production preview gross income mismatch."
}
if ([Math]::Abs([double]$serverProduction.data.beanCostPerSecond - 4) -gt 0.0001) {
    throw "Server production preview bean cost mismatch."
}

if ([double]$initialResources.data.coin -ne 12450000 -or [double]$initialResources.data.bean -ne 8240) {
    throw "Initial resources mismatch."
}

$catUpgrade = Read-Json (Invoke-WebRequest `
    -Uri "$ApiBaseUrl/api/cats/c_001/upgrade?playerId=$playerId" `
    -Method Post `
    -ContentType "application/json" `
    -Body "{}" `
    -UseBasicParsing)

if ($catUpgrade.data.catId -ne "c_001" -or [int]$catUpgrade.data.previousLevel -ne 1 -or [int]$catUpgrade.data.level -ne 2) {
    throw "Cat upgrade level response mismatch."
}

if ([int]$catUpgrade.data.coinSpent -ne 100 -or [double]$catUpgrade.data.coinBalance -ne 12449900) {
    throw "Cat upgrade resource balance mismatch."
}

$catFeed = Read-Json (Invoke-WebRequest `
    -Uri "$ApiBaseUrl/api/cats/c_001/feed?playerId=$playerId" `
    -Method Post `
    -ContentType "application/json" `
    -Body "{}" `
    -UseBasicParsing)

if ($catFeed.data.catId -ne "c_001" -or [int]$catFeed.data.previousWeight -ne 20 -or [int]$catFeed.data.weight -ne 21) {
    throw "Cat feed weight response mismatch."
}

if ([int]$catFeed.data.catFoodSpent -ne 9 -or [double]$catFeed.data.catFoodBalance -ne 3501) {
    throw "Cat feed resource balance mismatch."
}

$catUnlock = Read-Json (Invoke-WebRequest `
    -Uri "$ApiBaseUrl/api/cats/c_005/unlock?playerId=$playerId" `
    -Method Post `
    -ContentType "application/json" `
    -Body "{}" `
    -UseBasicParsing)

if ($catUnlock.data.catId -ne "c_005" -or -not $catUnlock.data.isUnlocked -or [int]$catUnlock.data.level -ne 1 -or [int]$catUnlock.data.weight -ne 22) {
    throw "Cat unlock response mismatch."
}

if ([int]$catUnlock.data.coinSpent -ne 12000 -or [double]$catUnlock.data.coinBalance -ne 12437900) {
    throw "Cat unlock resource balance mismatch."
}

$catSnapshot = Read-Json (Invoke-WebRequest -Uri "$ApiBaseUrl/api/cats?playerId=$playerId" -UseBasicParsing)
$catRows = @($catSnapshot.data)
$cat001 = $catRows | Where-Object { $_.catId -eq "c_001" } | Select-Object -First 1
$cat002 = $catRows | Where-Object { $_.catId -eq "c_002" } | Select-Object -First 1
$cat005 = $catRows | Where-Object { $_.catId -eq "c_005" } | Select-Object -First 1
if ($catRows.Count -ne 5 -or -not $cat001 -or -not $cat002 -or -not $cat005) {
    throw "Cat snapshot missing expected cats."
}
if (-not $cat001.isUnlocked -or [int]$cat001.level -ne 2 -or [int]$cat001.weight -ne 21) {
    throw "Cat snapshot c_001 mismatch."
}
if ($cat001.assignedBuildingId -ne "building_cafe_1f") {
    throw "Cat snapshot c_001 assignment mismatch."
}
if ($cat001.rarity -ne "B" -or $cat001.role -ne "producer" -or [int]$cat001.baseProduction -ne 10 -or [int]$cat001.baseBeanCost -ne 5 -or [int]$cat001.baseSalary -ne 1 -or [int]$cat001.baseWeight -ne 20 -or $cat001.skillId -ne "s_001") {
    throw "Cat snapshot c_001 metadata mismatch."
}
if ($cat002.isUnlocked -or [int]$cat002.level -ne 1 -or [int]$cat002.weight -ne 15) {
    throw "Cat snapshot c_002 locked default mismatch."
}
if ($cat002.rarity -ne "A" -or $cat002.role -ne "launcher") {
    throw "Cat snapshot c_002 metadata mismatch."
}
if (-not $cat005.isUnlocked -or [int]$cat005.level -ne 1 -or [int]$cat005.weight -ne 22) {
    throw "Cat snapshot c_005 mismatch."
}

$catAssignment = Read-Json (Invoke-WebRequest `
    -Uri "$ApiBaseUrl/api/cats/c_001/assignment?playerId=$playerId" `
    -Method Post `
    -ContentType "application/json" `
    -Body (@{ buildingId = "building_material_2f" } | ConvertTo-Json) `
    -UseBasicParsing)

if ($catAssignment.data.catId -ne "c_001" -or $catAssignment.data.assignedBuildingId -ne "building_material_2f") {
    throw "Cat assignment response mismatch."
}

$postAssignmentCats = Read-Json (Invoke-WebRequest -Uri "$ApiBaseUrl/api/cats?playerId=$playerId" -UseBasicParsing)
$postAssignmentCat001 = @($postAssignmentCats.data) | Where-Object { $_.catId -eq "c_001" } | Select-Object -First 1
if ($postAssignmentCat001.assignedBuildingId -ne "building_material_2f") {
    throw "Cat assignment snapshot mismatch."
}

$buildingUpgrade = Read-Json (Invoke-WebRequest `
    -Uri "$ApiBaseUrl/api/buildings/building_cafe_1f/upgrade?playerId=$playerId" `
    -Method Post `
    -ContentType "application/json" `
    -Body "{}" `
    -UseBasicParsing)

if ($buildingUpgrade.data.buildingId -ne "building_cafe_1f" -or [int]$buildingUpgrade.data.previousLevel -ne 6 -or [int]$buildingUpgrade.data.level -ne 7) {
    throw "Building upgrade response mismatch."
}
if ([int]$buildingUpgrade.data.coinSpent -ne 59481 -or [double]$buildingUpgrade.data.coinBalance -ne 12378419) {
    throw "Building upgrade resource balance mismatch."
}

$postBuildingSnapshot = Read-Json (Invoke-WebRequest -Uri "$ApiBaseUrl/api/buildings?playerId=$playerId" -UseBasicParsing)
$postBuildingCafe = @($postBuildingSnapshot.data) | Where-Object { $_.buildingId -eq "building_cafe_1f" } | Select-Object -First 1
if ([int]$postBuildingCafe.level -ne 7) {
    throw "Building upgrade snapshot mismatch."
}

$equipmentUpgrade = Read-Json (Invoke-WebRequest `
    -Uri "$ApiBaseUrl/api/cats/c_001/equipment/equip_cup_lucky/upgrade?playerId=$playerId" `
    -Method Post `
    -ContentType "application/json" `
    -Body "{}" `
    -UseBasicParsing)

if ($equipmentUpgrade.data.catId -ne "c_001" -or $equipmentUpgrade.data.itemId -ne "equip_cup_lucky" -or [int]$equipmentUpgrade.data.previousLevel -ne 1 -or [int]$equipmentUpgrade.data.level -ne 2) {
    throw "Equipment upgrade response mismatch."
}

if ([int]$equipmentUpgrade.data.coinSpent -ne 90 -or [double]$equipmentUpgrade.data.coinBalance -ne 12378329) {
    throw "Equipment upgrade resource balance mismatch."
}

$postEquipmentCats = Read-Json (Invoke-WebRequest -Uri "$ApiBaseUrl/api/cats?playerId=$playerId" -UseBasicParsing)
$postEquipmentCat001 = @($postEquipmentCats.data) | Where-Object { $_.catId -eq "c_001" } | Select-Object -First 1
if ([int]$postEquipmentCat001.equipmentLevels.equip_cup_lucky -ne 2) {
    throw "Equipment level snapshot mismatch."
}

$researchUnlock = Read-Json (Invoke-WebRequest `
    -Uri "$ApiBaseUrl/api/research/res_basic_prod/unlock?playerId=$playerId" `
    -Method Post `
    -ContentType "application/json" `
    -Body "{}" `
    -UseBasicParsing)

if ($researchUnlock.data.researchId -ne "res_basic_prod" -or -not $researchUnlock.data.isUnlocked) {
    throw "Research unlock response mismatch."
}

if ([int]$researchUnlock.data.researchPointSpent -ne 100 -or [double]$researchUnlock.data.researchPointBalance -ne 100) {
    throw "Research unlock resource balance mismatch."
}
if ([int]$researchUnlock.data.previousLevel -ne 0 `
    -or [int]$researchUnlock.data.level -ne 1 `
    -or [int]$researchUnlock.data.maxLevel -ne 10 `
    -or [int]$researchUnlock.data.currentEffectValue -ne 10 `
    -or [int]$researchUnlock.data.nextEffectValue -ne 11) {
    throw "Research unlock level progression mismatch."
}

$researchSnapshot = Read-Json (Invoke-WebRequest -Uri "$ApiBaseUrl/api/research?playerId=$playerId" -UseBasicParsing)
$researchRows = @($researchSnapshot.data)
$researchBasic = $researchRows | Where-Object { $_.researchId -eq "res_basic_prod" } | Select-Object -First 1
$researchBean = $researchRows | Where-Object { $_.researchId -eq "res_bean_save" } | Select-Object -First 1
$researchFinal = $researchRows | Where-Object { $_.researchId -eq "res_espresso" } | Select-Object -First 1
if ($researchRows.Count -ne 7) {
    throw "Research snapshot full catalog count mismatch."
}
if (-not $researchBasic -or -not $researchBasic.isUnlocked) {
    throw "Research snapshot missing unlocked basic research."
}
if ([int]$researchBasic.cost -ne 100 -or $researchBasic.effectType -ne "coin_production_mult" -or [int]$researchBasic.effectValue -ne 10) {
    throw "Research snapshot basic metadata mismatch."
}
if ([int]$researchBasic.level -ne 1 `
    -or [int]$researchBasic.maxLevel -ne 10 `
    -or [int]$researchBasic.nextCost -ne 135 `
    -or [double]$researchBasic.costGrowth -ne 1.35 `
    -or [int]$researchBasic.currentEffectValue -ne 10 `
    -or [int]$researchBasic.nextEffectValue -ne 11) {
    throw "Research snapshot level metadata mismatch."
}
if (-not $researchBean -or $researchBean.isUnlocked) {
    throw "Research snapshot locked bean research mismatch."
}
if ([int]$researchBean.cost -ne 150 -or $researchBean.effectType -ne "bean_reduce" -or [int]$researchBean.effectValue -ne 5 -or $researchBean.parentResearchId -ne "res_basic_prod") {
    throw "Research snapshot bean metadata mismatch."
}
if (-not $researchFinal -or $researchFinal.isUnlocked -or [int]$researchFinal.cost -ne 500) {
    throw "Research snapshot final-node metadata mismatch."
}
$finalParents = @($researchFinal.parentResearchIds)
if ($finalParents.Count -ne 3 `
    -or $finalParents -notcontains "res_extract_2" `
    -or $finalParents -notcontains "res_roast_2" `
    -or $finalParents -notcontains "res_ferment_2") {
    throw "Research snapshot final-node prerequisites mismatch."
}

$shopPurchase = Read-Json (Invoke-WebRequest `
    -Uri "$ApiBaseUrl/api/shop/purchase?playerId=$playerId" `
    -Method Post `
    -ContentType "application/json" `
    -Body (@{
        shopItemId = "shop_cat_food_1"
        count = 1
    } | ConvertTo-Json) `
    -UseBasicParsing)

if ($shopPurchase.data.itemId -ne "item_cat_food_pack" -or [int]$shopPurchase.data.pricePaid -ne 500) {
    throw "Shop purchase response mismatch."
}

if ([int]$shopPurchase.data.remainingDaily -ne 4 -or [double]$shopPurchase.data.coinBalance -ne 12377829) {
    throw "Shop purchase resource balance mismatch."
}

$limitDeviceId = "smoke-limit-$([Guid]::NewGuid().ToString('N'))"
$limitAuth = Invoke-WebRequest `
    -Uri "$ApiBaseUrl/api/auth/guest" `
    -Method Post `
    -ContentType "application/json" `
    -Body (@{ deviceId = $limitDeviceId; companyName = "FatCat Limit Smoke" } | ConvertTo-Json) `
    -UseBasicParsing
$limitPlayerId = (Read-Json $limitAuth).data.playerId
$limitPurchase = Read-Json (Invoke-WebRequest `
    -Uri "$ApiBaseUrl/api/shop/purchase?playerId=$limitPlayerId" `
    -Method Post `
    -ContentType "application/json" `
    -Body (@{
        shopItemId = "shop_cat_food_1"
        count = 5
    } | ConvertTo-Json) `
    -UseBasicParsing)
if ([int]$limitPurchase.data.remainingDaily -ne 0) {
    throw "Shop purchase daily limit remaining mismatch."
}
try {
    Invoke-WebRequest `
        -Uri "$ApiBaseUrl/api/shop/purchase?playerId=$limitPlayerId" `
        -Method Post `
        -ContentType "application/json" `
        -Body (@{
            shopItemId = "shop_cat_food_1"
            count = 1
        } | ConvertTo-Json) `
        -UseBasicParsing | Out-Null
    throw "Shop purchase should fail after daily limit."
} catch {
    if ($_.Exception.Response.StatusCode.value__ -ne 400) {
        throw
    }
}

$mailClaim = Read-Json (Invoke-WebRequest `
    -Uri "$ApiBaseUrl/api/mail/welcome/claim?playerId=$playerId" `
    -Method Post `
    -ContentType "application/json" `
    -Body "{}" `
    -UseBasicParsing)

if (-not $mailClaim.data.claimed -or [int]$mailClaim.data.rewardCoin -ne 2500 -or [int]$mailClaim.data.rewardCatFood -ne 20) {
    throw "Mail claim reward mismatch."
}

if ([double]$mailClaim.data.coinBalance -ne 12380329 -or [double]$mailClaim.data.catFoodBalance -ne 3521) {
    throw "Mail claim resource balance mismatch."
}

$launch = Read-Json (Invoke-WebRequest `
    -Uri "$ApiBaseUrl/api/launch?playerId=$playerId" `
    -Method Post `
    -ContentType "application/json" `
    -Body (@{
        clientRequestId = "smoke-launch"
        launchSeconds = 10
        availableBean = 3200
        production = @{
            grossCoinPerSecond = 999999
            wageCostPerSecond = 0
            beanCostPerSecond = 0
            buildings = @()
        }
    } | ConvertTo-Json -Depth 5) `
    -UseBasicParsing)

if (-not $launch.data.accepted -or [int]$launch.data.coinGained -ne 2761 -or [int]$launch.data.beanSpent -ne 40) {
    throw "Launch settlement mismatch."
}

if ([double]$launch.data.coinBalance -ne 12383090 -or [double]$launch.data.beanBalance -ne 8200) {
    throw "Launch resource balance mismatch."
}

$launchRepeat = Read-Json (Invoke-WebRequest `
    -Uri "$ApiBaseUrl/api/launch?playerId=$playerId" `
    -Method Post `
    -ContentType "application/json" `
    -Body (@{
        clientRequestId = "smoke-launch"
        launchSeconds = 600
        availableBean = 999999
        production = @{
            grossCoinPerSecond = 999
            wageCostPerSecond = 0
            beanCostPerSecond = 1
            buildings = @()
        }
    } | ConvertTo-Json -Depth 5) `
    -UseBasicParsing)

if ($launchRepeat.data.launchId -ne $launch.data.launchId -or [int]$launchRepeat.data.coinGained -ne [int]$launch.data.coinGained) {
    throw "Launch idempotency mismatch."
}

if ([double]$launchRepeat.data.coinBalance -ne [double]$launch.data.coinBalance -or [double]$launchRepeat.data.beanBalance -ne [double]$launch.data.beanBalance) {
    throw "Launch idempotency balance mismatch."
}

$postLaunchResources = Read-Json (Invoke-WebRequest -Uri "$ApiBaseUrl/api/resources?playerId=$playerId" -UseBasicParsing)
if ([double]$postLaunchResources.data.coin -ne [double]$launch.data.coinBalance -or [double]$postLaunchResources.data.bean -ne [double]$launch.data.beanBalance) {
    throw "Post-launch resources mismatch."
}

$transactions = Read-Json (Invoke-WebRequest -Uri "$ApiBaseUrl/api/resources/transactions?playerId=$playerId&limit=10" -UseBasicParsing)
$transactionRows = @($transactions.data)
if ($transactionRows.Count -lt 9) {
    throw "Resource transaction count mismatch."
}
if ($transactionRows[0].sourceType -ne "launch" -or $transactionRows[1].sourceType -ne "mail_claim" -or $transactionRows[2].sourceType -ne "shop_purchase" -or $transactionRows[3].sourceType -ne "research_unlock" -or $transactionRows[4].sourceType -ne "equipment_upgrade" -or $transactionRows[5].sourceType -ne "building_upgrade" -or $transactionRows[6].sourceType -ne "cat_unlock" -or $transactionRows[7].sourceType -ne "cat_feed" -or $transactionRows[8].sourceType -ne "cat_upgrade") {
    throw "Resource transaction order mismatch."
}
if ([double]$transactionRows[0].coinDelta -ne 2761 -or [double]$transactionRows[0].beanDelta -ne -40) {
    throw "Launch transaction delta mismatch."
}
if ([double]$transactionRows[1].coinDelta -ne 2500 -or [double]$transactionRows[2].coinDelta -ne -500 -or [double]$transactionRows[3].researchPointDelta -ne -100 -or [double]$transactionRows[4].coinDelta -ne -90 -or [double]$transactionRows[5].coinDelta -ne -59481 -or [double]$transactionRows[6].coinDelta -ne -12000 -or [double]$transactionRows[7].catFoodDelta -ne -9 -or [double]$transactionRows[8].coinDelta -ne -100) {
    throw "Resource transaction delta mismatch."
}

$settingKeys = @()
if ($settings.data.settings) {
    $settingKeys = $settings.data.settings | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name
}

$summary = [ordered]@{
    api = $ApiBaseUrl
    origin = $Origin
    playerId = $playerId
    mailCount = @($mail.data).Count
    friendCount = @($friends.data).Count
    settings = $settingKeys -join ","
    initialCoin = $initialResources.data.coin
    initialBean = $initialResources.data.bean
    buildingSnapshotCount = $buildingRows.Count
    buildingCafeLevel = $buildingCafe.level
    buildingUpgradeLevel = $buildingUpgrade.data.level
    buildingUpgradeCoinSpent = $buildingUpgrade.data.coinSpent
    catUpgradeLevel = $catUpgrade.data.level
    catUpgradeCoinSpent = $catUpgrade.data.coinSpent
    catUpgradeCoinBalance = $catUpgrade.data.coinBalance
    catFeedWeight = $catFeed.data.weight
    catFeedCatFoodSpent = $catFeed.data.catFoodSpent
    catFeedCatFoodBalance = $catFeed.data.catFoodBalance
    catUnlockId = $catUnlock.data.catId
    catUnlockCoinSpent = $catUnlock.data.coinSpent
    catUnlockCoinBalance = $catUnlock.data.coinBalance
    catSnapshotCount = $catRows.Count
    catSnapshotC001 = "Lv$($cat001.level)/W$($cat001.weight)"
    catSnapshotC005 = "Lv$($cat005.level)/W$($cat005.weight)"
    catAssignment = $catAssignment.data.assignedBuildingId
    equipmentUpgradeItem = $equipmentUpgrade.data.itemId
    equipmentUpgradeLevel = $equipmentUpgrade.data.level
    equipmentUpgradeCoinSpent = $equipmentUpgrade.data.coinSpent
    equipmentUpgradeCoinBalance = $equipmentUpgrade.data.coinBalance
    researchUnlocked = $researchUnlock.data.researchId
    researchLevel = "$($researchUnlock.data.previousLevel)->$($researchUnlock.data.level)/$($researchUnlock.data.maxLevel)"
    researchPointSpent = $researchUnlock.data.researchPointSpent
    researchPointBalance = $researchUnlock.data.researchPointBalance
    researchNextCost = $researchBasic.nextCost
    researchEffect = "$($researchBasic.currentEffectValue)->$($researchBasic.nextEffectValue)"
    researchSnapshotCount = $researchRows.Count
    shopItem = $shopPurchase.data.itemId
    shopPricePaid = $shopPurchase.data.pricePaid
    shopCoinBalance = $shopPurchase.data.coinBalance
    shopRemainingDaily = $shopPurchase.data.remainingDaily
    shopLimitRemainingDaily = $limitPurchase.data.remainingDaily
    mailCoin = $mailClaim.data.rewardCoin
    mailCatFood = $mailClaim.data.rewardCatFood
    mailCoinBalance = $mailClaim.data.coinBalance
    mailCatFoodBalance = $mailClaim.data.catFoodBalance
    productionNet = $production.data.netCoinPerSecond
    serverProductionNet = $serverProduction.data.netCoinPerSecond
    serverProductionBean = $serverProduction.data.beanCostPerSecond
    launchCoin = $launch.data.coinGained
    launchBean = $launch.data.beanSpent
    launchCoinBalance = $launch.data.coinBalance
    launchBeanBalance = $launch.data.beanBalance
    resourceCoin = $postLaunchResources.data.coin
    resourceBean = $postLaunchResources.data.bean
    transactionCount = $transactionRows.Count
    latestTransaction = $transactionRows[0].sourceType
    launchRepeat = $launchRepeat.data.launchId -eq $launch.data.launchId
}

$summary | ConvertTo-Json -Depth 4
