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

public sealed record ShopStateDto(
    string ShopItemId,
    string ItemId,
    string PriceType,
    int PriceAmount,
    int LimitDaily,
    int PurchasedToday,
    int RemainingDaily,
    long UpdatedAt);

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

public sealed record FriendRoomDto(
    string BuildingId,
    string Floor,
    string Name,
    int Level,
    int ProductionPerSecond,
    int AssignedCatCount,
    string FeaturedCatName,
    int DecorScore,
    IReadOnlyList<FriendDecorDto> Decorations);

public sealed record FriendDecorDto(
    string DecorId,
    string Name,
    int Score,
    bool IsPlaced);

public sealed record DecorStateDto(
    string DecorId,
    string BuildingId,
    string Name,
    int Score,
    bool IsPlaced,
    long UpdatedAt);

public sealed record DecorPlacementRequest(
    string BuildingId,
    bool IsPlaced);

public sealed record DecorCatalogItemDto(
    string DecorId,
    string Name,
    string Description,
    string DefaultBuildingId,
    int Score,
    string PriceType,
    int PriceAmount,
    bool Owned);

public sealed record DecorPurchaseResponse(
    DecorStateDto Decor,
    string PriceType,
    int PricePaid,
    double CoinBalance,
    double BeanBalance,
    double CatFoodBalance,
    double DiamondBalance,
    double ResearchPointBalance,
    long ServerTime);

public sealed record DecorCollectionTierDto(
    string TierId,
    int TargetCount,
    string RewardType,
    int RewardAmount,
    bool Claimed,
    bool Claimable);

public sealed record DecorCollectionDto(
    int OwnedCount,
    int TotalCount,
    int OwnedScore,
    IReadOnlyList<DecorCollectionTierDto> Tiers,
    long ServerTime);

public sealed record DecorCollectionClaimResponse(
    DecorCollectionDto Collection,
    string RewardType,
    int RewardAmount,
    double CoinBalance,
    double BeanBalance,
    double CatFoodBalance,
    double DiamondBalance,
    double ResearchPointBalance,
    long ServerTime);

public sealed record FriendProfileDto(
    bool IsRealPlayer,
    string? PlayerId,
    string? InviteCode,
    long? LastActiveAt,
    string PresenceStatus,
    int UnlockedCatCount,
    int TotalBuildingLevel);

public sealed record PlayerPresenceDto(
    string Status,
    long LastActiveAt,
    long ServerTime);

public sealed record SocialRealtimeEventDto(
    string EventId,
    string EventType,
    string ActorPlayerId,
    string ActorCompanyName,
    int RewardValue,
    long CreatedAt,
    int BoostPercent = 0,
    long? BoostEndsAt = null,
    int CoopProgress = 0,
    int CoopTarget = 0,
    bool CoopClaimable = false);

public sealed record FriendDto(
    string Id,
    string Name,
    int Level,
    int IncomePerSecond,
    long? LastVisitedAt,
    long? LastGiftAt,
    long? LastHelpAt,
    FriendProfileDto Profile,
    IReadOnlyList<FriendRoomDto> Rooms);

public sealed record FriendActionResponse(
    FriendDto Friend,
    bool Rewarded,
    int RewardCoin,
    int RewardCatFood,
    double CoinBalance,
    double BeanBalance,
    double CatFoodBalance,
    double DiamondBalance,
    double ResearchPointBalance,
    long ServerTime,
    string? LimitedReason = null);

public sealed record FriendBoostStateDto(
    bool Active,
    int BoostPercent,
    long? BoostEndsAt,
    string BoostedByName,
    long ServerTime);

public sealed record FriendBoostContributionDto(
    string ContributionId,
    string SourcePlayerId,
    string SourceName,
    int BoostPercent,
    long CreatedAt,
    long ExpiresAt,
    bool Active);

public sealed record FriendBoostHistoryDto(
    int ActiveBoostPercent,
    int MaxBoostPercent,
    int ActiveContributionCount,
    IReadOnlyList<FriendBoostContributionDto> Entries,
    long ServerTime);

public sealed record FriendHelpResponse(
    FriendDto Friend,
    bool Applied,
    FriendBoostStateDto Boost,
    string? LimitedReason = null);

public sealed record FriendCoopGoalDto(
    int GoalDate,
    int Progress,
    int Target,
    bool Claimable,
    bool Claimed,
    int RewardDiamond,
    long UpdatedAt,
    long ServerTime,
    IReadOnlyList<FriendCoopTierDto> Tiers);

public sealed record FriendCoopTierDto(
    string TierId,
    int Target,
    string RewardType,
    int RewardAmount,
    bool Claimable,
    bool Claimed);

public sealed record FriendCoopClaimResponse(
    bool Claimed,
    int RewardDiamond,
    FriendCoopGoalDto Goal,
    double CoinBalance,
    double BeanBalance,
    double CatFoodBalance,
    double DiamondBalance,
    double ResearchPointBalance,
    string? LimitedReason = null);

public sealed record FriendCoopTierClaimResponse(
    bool Claimed,
    string TierId,
    string RewardType,
    int RewardAmount,
    FriendCoopGoalDto Goal,
    double CoinBalance,
    double BeanBalance,
    double CatFoodBalance,
    double DiamondBalance,
    double ResearchPointBalance,
    string? LimitedReason = null);

public sealed record PlayerSocialProfileDto(
    string PlayerId,
    string CompanyName,
    int Level,
    int IncomePerSecond,
    string InviteCode,
    bool IsSelf,
    bool IsFriend);

public sealed record FriendSearchResultDto(
    string PlayerId,
    string CompanyName,
    int Level,
    int IncomePerSecond,
    string InviteCode,
    bool IsSelf,
    bool IsFriend);

public sealed record AddFriendRequest(string FriendPlayerId, string? InviteCode = null);

public sealed record CreateFriendRequestRequest(string FriendPlayerId, string? InviteCode = null);

public sealed record FriendRequestDto(
    string Id,
    string Direction,
    string Status,
    string PlayerId,
    string CompanyName,
    int Level,
    int IncomePerSecond,
    string InviteCode,
    long CreatedAt,
    long UpdatedAt);

public sealed record FriendActivityDto(
    string Id,
    string ActivityType,
    string FriendId,
    string FriendName,
    long CreatedAt);

public sealed record LeaderboardEntryDto(
    string PlayerId,
    string CompanyName,
    int Level,
    int Rank,
    int Score,
    bool IsSelf,
    long UpdatedAt);

public sealed record LeaderboardDto(
    string BoardId,
    IReadOnlyList<LeaderboardEntryDto> Entries,
    LeaderboardEntryDto? Self,
    long ServerTime);

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
