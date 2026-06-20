using System.Text.Json.Nodes;

namespace FatCat.Application;

public sealed record AuthGuestRequest(string DeviceId, string CompanyName);

public sealed record AuthGuestResponse(Guid PlayerId, string Token, bool IsNewPlayer);

public sealed record PlayerDto(Guid Id, string DeviceId, string CompanyName, int Level, int Exp, int ExpToNext);

public sealed record ResourceStateDto(
    double Coin,
    double Bean,
    double CatFood,
    double Diamond,
    double ResearchPoint,
    long UpdatedAt);

public sealed record ResourceTransactionDto(
    string Id,
    string SourceType,
    string SourceKey,
    string? ClientRequestId,
    double CoinDelta,
    double BeanDelta,
    double CatFoodDelta,
    double DiamondDelta,
    double ResearchPointDelta,
    double CoinBalance,
    double BeanBalance,
    double CatFoodBalance,
    double DiamondBalance,
    double ResearchPointBalance,
    long CreatedAt);

public sealed record BootstrapDto(string ConfigVersion, int MinClientVersion, string[] ServerFeatures);

public sealed record SaveSyncRequest(int ClientVersion, long LocalUpdatedAt, JsonObject Save);

public sealed record SaveSyncResponse(bool Accepted, JsonObject? AuthoritativeSave = null, string? ConflictReason = null);

public sealed record MailDto(
    string Id,
    string Title,
    string Body,
    int RewardCoin,
    int RewardCatFood,
    int RewardDiamond,
    bool IsClaimed,
    long CreatedAt);

public sealed record ClaimMailResponse(
    string MailId,
    bool Claimed,
    int RewardCoin,
    int RewardCatFood,
    int RewardDiamond,
    double CoinBalance,
    double BeanBalance,
    double CatFoodBalance,
    double DiamondBalance,
    double ResearchPointBalance);

public sealed record ShopPurchaseRequest(string ShopItemId, int Count = 1);

public sealed record ShopPurchaseResponse(
    string ShopItemId,
    string ItemId,
    int Count,
    int RemainingDaily,
    string PriceType,
    int PricePaid,
    double CoinBalance,
    double BeanBalance,
    double CatFoodBalance,
    double DiamondBalance,
    double ResearchPointBalance,
    long ServerTime);

public sealed record CatUpgradeRequest(string CatId);

public sealed record CatUpgradeResponse(
    string CatId,
    int Level,
    int PreviousLevel,
    int CoinSpent,
    double CoinBalance,
    double BeanBalance,
    double CatFoodBalance,
    double DiamondBalance,
    double ResearchPointBalance,
    long ServerTime);

public sealed record CatFeedRequest(string CatId);

public sealed record CatFeedResponse(
    string CatId,
    int Weight,
    int PreviousWeight,
    int CatFoodSpent,
    double CoinBalance,
    double BeanBalance,
    double CatFoodBalance,
    double DiamondBalance,
    double ResearchPointBalance,
    long ServerTime);

public sealed record CatUnlockRequest(string CatId);

public sealed record CatUnlockResponse(
    string CatId,
    bool IsUnlocked,
    int Level,
    int Weight,
    int CoinSpent,
    double CoinBalance,
    double BeanBalance,
    double CatFoodBalance,
    double DiamondBalance,
    double ResearchPointBalance,
    long ServerTime);

public sealed record CatStateDto(
    string CatId,
    bool IsUnlocked,
    int Level,
    int Weight,
    string AssignedBuildingId,
    IReadOnlyDictionary<string, string> Equipment,
    IReadOnlyDictionary<string, int> EquipmentLevels,
    long UpdatedAt,
    string Rarity,
    string Role,
    int BaseProduction,
    int BaseBeanCost,
    int BaseSalary,
    int BaseWeight,
    string SkillId);

public sealed record CatAssignmentRequest(string? BuildingId);

public sealed record CatAssignmentResponse(
    string CatId,
    string AssignedBuildingId,
    long ServerTime);

public sealed record BuildingStateDto(
    string BuildingId,
    int Level,
    int MaxLevel,
    int EffectValue,
    int UpgradeCost,
    int ScheduleCapacity,
    long UpdatedAt);

public sealed record BuildingUpgradeResponse(
    string BuildingId,
    int Level,
    int PreviousLevel,
    int MaxLevel,
    int CoinSpent,
    int EffectValue,
    int UpgradeCost,
    int ScheduleCapacity,
    double CoinBalance,
    double BeanBalance,
    double CatFoodBalance,
    double DiamondBalance,
    double ResearchPointBalance,
    long ServerTime);

public sealed record EquipmentUpgradeResponse(
    string CatId,
    string Slot,
    string ItemId,
    int Level,
    int PreviousLevel,
    int MaxLevel,
    int CoinSpent,
    double CoinBalance,
    double BeanBalance,
    double CatFoodBalance,
    double DiamondBalance,
    double ResearchPointBalance,
    long ServerTime);

public sealed record ResearchStateDto(
    string ResearchId,
    bool IsUnlocked,
    long UpdatedAt,
    int Cost,
    string EffectType,
    int EffectValue,
    string? ParentResearchId);

public sealed record ResearchUnlockRequest(string ResearchId);

public sealed record ResearchUnlockResponse(
    string ResearchId,
    bool IsUnlocked,
    int ResearchPointSpent,
    double CoinBalance,
    double BeanBalance,
    double CatFoodBalance,
    double DiamondBalance,
    double ResearchPointBalance,
    long ServerTime);

public sealed record FriendDto(
    string Id,
    string Name,
    int Level,
    int IncomePerSecond,
    long? LastVisitedAt,
    long? LastGiftAt);

public sealed record SettingsDto(Dictionary<string, bool> Settings);

public sealed record ProductionBuildingPreviewDto(
    string BuildingId,
    double GrossCoinPerSecond,
    double WageCostPerSecond,
    double NetCoinPerSecond,
    double BeanCostPerSecond);

public sealed record ProductionPreviewRequest(
    double GrossCoinPerSecond,
    double WageCostPerSecond,
    double BeanCostPerSecond,
    IReadOnlyList<ProductionBuildingPreviewDto>? Buildings = null,
    bool IncludesClientModifiers = true);

public sealed record ProductionPreviewResponse(
    double GrossCoinPerSecond,
    double WageCostPerSecond,
    double NetCoinPerSecond,
    double BeanCostPerSecond,
    IReadOnlyList<ProductionBuildingPreviewDto> Buildings);

public sealed record LaunchRequest(
    string? ClientRequestId,
    int LaunchSeconds,
    double AvailableBean,
    ProductionPreviewRequest Production);

public sealed record LaunchResponse(
    string LaunchId,
    bool Accepted,
    int RequestedSeconds,
    double ProductiveSeconds,
    int CoinGained,
    int BeanSpent,
    double NetCoinPerSecond,
    double WageCostPerSecond,
    double BeanCostPerSecond,
    double CoinBalance,
    double BeanBalance,
    double CatFoodBalance,
    double DiamondBalance,
    double ResearchPointBalance,
    long ServerTime,
    string? RejectedReason = null);
