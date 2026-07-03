import { FeatureSaveData, GameSaveData } from "../model/SaveData";

export type ApiEnvelope<T> = {
    ok: boolean;
    data?: T;
    error?: string;
    serverTime?: number;
};

export type AuthGuestRequest = {
    deviceId: string;
    companyName: string;
};

export type AuthGuestResponse = {
    playerId: string;
    token: string;
    isNewPlayer: boolean;
};

export type SaveSyncRequest = {
    clientVersion: number;
    localUpdatedAt: number;
    save: GameSaveData;
};

export type SaveSyncResponse = {
    accepted: boolean;
    authoritativeSave?: GameSaveData;
    conflictReason?: string;
};

export type ResourceStateDto = {
    coin: number;
    bean: number;
    catFood: number;
    diamond: number;
    researchPoint: number;
    updatedAt: number;
};

export type DailyOrderDto = {
    orderDate: number;
    progress: number;
    target: number;
    claimable: boolean;
    claimed: boolean;
    rewardCoin: number;
    rewardResearchPoint: number;
    updatedAt: number;
    serverTime: number;
};

export type DailyOrderClaimResponse = {
    claimed: boolean;
    order: DailyOrderDto;
    coinBalance: number;
    beanBalance: number;
    catFoodBalance: number;
    diamondBalance: number;
    researchPointBalance: number;
    limitedReason?: string | null;
};

export type MailDto = {
    id: string;
    title: string;
    body: string;
    rewardCoin: number;
    rewardCatFood: number;
    rewardDiamond: number;
    isClaimed: boolean;
    createdAt: number;
};

export type ClaimMailResponse = {
    mailId: string;
    claimed: boolean;
    rewardCoin: number;
    rewardCatFood: number;
    rewardDiamond: number;
    coinBalance: number;
    beanBalance: number;
    catFoodBalance: number;
    diamondBalance: number;
    researchPointBalance: number;
};

export type ShopPurchaseRequest = {
    shopItemId: string;
    count?: number;
};

export type ShopPurchaseResponse = {
    shopItemId: string;
    itemId: string;
    count: number;
    remainingDaily: number;
    priceType: string;
    pricePaid: number;
    coinBalance: number;
    beanBalance: number;
    catFoodBalance: number;
    diamondBalance: number;
    researchPointBalance: number;
    serverTime: number;
};

export type ShopStateDto = {
    shopItemId: string;
    itemId: string;
    priceType: string;
    priceAmount: number;
    limitDaily: number;
    purchasedToday: number;
    remainingDaily: number;
    updatedAt: number;
};

export type CatUpgradeResponse = {
    catId: string;
    level: number;
    previousLevel: number;
    coinSpent: number;
    coinBalance: number;
    beanBalance: number;
    catFoodBalance: number;
    diamondBalance: number;
    researchPointBalance: number;
    serverTime: number;
};

export type CatFeedResponse = {
    catId: string;
    weight: number;
    previousWeight: number;
    catFoodSpent: number;
    coinBalance: number;
    beanBalance: number;
    catFoodBalance: number;
    diamondBalance: number;
    researchPointBalance: number;
    serverTime: number;
};

export type CatUnlockResponse = {
    catId: string;
    isUnlocked: boolean;
    level: number;
    weight: number;
    coinSpent: number;
    coinBalance: number;
    beanBalance: number;
    catFoodBalance: number;
    diamondBalance: number;
    researchPointBalance: number;
    serverTime: number;
};

export type CatStateDto = {
    catId: string;
    isUnlocked: boolean;
    level: number;
    weight: number;
    assignedBuildingId?: string;
    equipment?: Record<string, string>;
    equipmentLevels?: Record<string, number>;
    updatedAt: number;
    rarity?: string;
    role?: string;
    baseProduction?: number;
    baseBeanCost?: number;
    baseSalary?: number;
    baseWeight?: number;
    skillId?: string;
};

export type CatAssignmentResponse = {
    catId: string;
    assignedBuildingId: string;
    serverTime: number;
};

export type BuildingStateDto = {
    buildingId: string;
    level: number;
    maxLevel: number;
    effectValue: number;
    upgradeCost: number;
    scheduleCapacity: number;
    updatedAt: number;
};

export type BuildingUpgradeResponse = {
    buildingId: string;
    level: number;
    previousLevel: number;
    maxLevel: number;
    coinSpent: number;
    effectValue: number;
    upgradeCost: number;
    scheduleCapacity: number;
    coinBalance: number;
    beanBalance: number;
    catFoodBalance: number;
    diamondBalance: number;
    researchPointBalance: number;
    serverTime: number;
};

export type EquipmentUpgradeResponse = {
    catId: string;
    slot: string;
    itemId: string;
    level: number;
    previousLevel: number;
    maxLevel: number;
    coinSpent: number;
    coinBalance: number;
    beanBalance: number;
    catFoodBalance: number;
    diamondBalance: number;
    researchPointBalance: number;
    serverTime: number;
};

export type ResearchStateDto = {
    researchId: string;
    isUnlocked: boolean;
    level?: number;
    maxLevel?: number;
    updatedAt: number;
    cost?: number;
    nextCost?: number;
    costGrowth?: number;
    effectType?: string;
    effectValue?: number;
    effectStep?: number;
    currentEffectValue?: number;
    nextEffectValue?: number;
    parentResearchId?: string | null;
    parentResearchIds?: string[];
};

export type ResearchUnlockResponse = {
    researchId: string;
    isUnlocked: boolean;
    previousLevel: number;
    level: number;
    maxLevel: number;
    researchPointSpent: number;
    currentEffectValue: number;
    nextEffectValue: number;
    coinBalance: number;
    beanBalance: number;
    catFoodBalance: number;
    diamondBalance: number;
    researchPointBalance: number;
    serverTime: number;
};

export type FriendDto = {
    id: string;
    name: string;
    level: number;
    incomePerSecond: number;
    lastVisitedAt?: number;
    lastGiftAt?: number;
    lastHelpAt?: number;
    profile: FriendProfileDto;
    rooms: FriendRoomDto[];
};

export type FriendProfileDto = {
    isRealPlayer: boolean;
    playerId?: string | null;
    inviteCode?: string | null;
    lastActiveAt?: number | null;
    presenceStatus: "online" | "recent" | "offline" | "system";
    unlockedCatCount: number;
    totalBuildingLevel: number;
};

export type PlayerPresenceDto = {
    status: "online" | "recent" | "offline";
    lastActiveAt: number;
    serverTime: number;
};

export type SocialRealtimeEventDto = {
    eventId: string;
    eventType: "friend_visit" | "friend_gift" | "friend_help";
    actorPlayerId: string;
    actorCompanyName: string;
    rewardValue: number;
    createdAt: number;
    boostPercent: number;
    boostEndsAt?: number | null;
    coopProgress: number;
    coopTarget: number;
    coopClaimable: boolean;
};

export type FriendRoomDto = {
    buildingId: string;
    floor: string;
    name: string;
    level: number;
    productionPerSecond: number;
    assignedCatCount: number;
    featuredCatName: string;
    decorScore: number;
    decorations: FriendDecorDto[];
};

export type FriendDecorDto = {
    decorId: string;
    name: string;
    score: number;
    isPlaced: boolean;
};

export type DecorStateDto = {
    decorId: string;
    buildingId: string;
    name: string;
    score: number;
    isPlaced: boolean;
    updatedAt: number;
};

export type DecorPlacementRequest = {
    buildingId: string;
    isPlaced: boolean;
};

export type DecorCatalogItemDto = {
    decorId: string;
    name: string;
    description: string;
    defaultBuildingId: string;
    score: number;
    priceType: string;
    priceAmount: number;
    owned: boolean;
};

export type DecorPurchaseResponse = {
    decor: DecorStateDto;
    priceType: string;
    pricePaid: number;
    coinBalance: number;
    beanBalance: number;
    catFoodBalance: number;
    diamondBalance: number;
    researchPointBalance: number;
    serverTime: number;
};

export type DecorCollectionTierDto = {
    tierId: string;
    targetCount: number;
    rewardType: string;
    rewardAmount: number;
    claimed: boolean;
    claimable: boolean;
};

export type DecorCollectionDto = {
    ownedCount: number;
    totalCount: number;
    ownedScore: number;
    tiers: DecorCollectionTierDto[];
    serverTime: number;
};

export type DecorCollectionClaimResponse = {
    collection: DecorCollectionDto;
    rewardType: string;
    rewardAmount: number;
    coinBalance: number;
    beanBalance: number;
    catFoodBalance: number;
    diamondBalance: number;
    researchPointBalance: number;
    serverTime: number;
};

export type FriendActionResponse = {
    friend: FriendDto;
    rewarded: boolean;
    rewardCoin: number;
    rewardCatFood: number;
    coinBalance: number;
    beanBalance: number;
    catFoodBalance: number;
    diamondBalance: number;
    researchPointBalance: number;
    serverTime: number;
    limitedReason?: string | null;
};

export type FriendBoostStateDto = {
    active: boolean;
    boostPercent: number;
    boostEndsAt?: number | null;
    boostedByName: string;
    serverTime: number;
};

export type FriendBoostContributionDto = {
    contributionId: string;
    sourcePlayerId: string;
    sourceName: string;
    boostPercent: number;
    createdAt: number;
    expiresAt: number;
    active: boolean;
};

export type FriendBoostHistoryDto = {
    activeBoostPercent: number;
    maxBoostPercent: number;
    activeContributionCount: number;
    entries: FriendBoostContributionDto[];
    serverTime: number;
};

export type FriendHelpResponse = {
    friend: FriendDto;
    applied: boolean;
    boost: FriendBoostStateDto;
    limitedReason?: string | null;
};

export type FriendCoopGoalDto = {
    goalDate: number;
    progress: number;
    target: number;
    claimable: boolean;
    claimed: boolean;
    rewardDiamond: number;
    updatedAt: number;
    serverTime: number;
    tiers: FriendCoopTierDto[];
};

export type FriendCoopTierDto = {
    tierId: string;
    target: number;
    rewardType: string;
    rewardAmount: number;
    claimable: boolean;
    claimed: boolean;
};

export type FriendCoopClaimResponse = {
    claimed: boolean;
    rewardDiamond: number;
    goal: FriendCoopGoalDto;
    coinBalance: number;
    beanBalance: number;
    catFoodBalance: number;
    diamondBalance: number;
    researchPointBalance: number;
    limitedReason?: string | null;
};

export type FriendCoopTierClaimResponse = {
    claimed: boolean;
    tierId: string;
    rewardType: string;
    rewardAmount: number;
    goal: FriendCoopGoalDto;
    coinBalance: number;
    beanBalance: number;
    catFoodBalance: number;
    diamondBalance: number;
    researchPointBalance: number;
    limitedReason?: string | null;
};

export type PlayerSocialProfileDto = {
    playerId: string;
    companyName: string;
    level: number;
    incomePerSecond: number;
    inviteCode: string;
    isSelf: boolean;
    isFriend: boolean;
};

export type FriendSearchResultDto = {
    playerId: string;
    companyName: string;
    level: number;
    incomePerSecond: number;
    inviteCode: string;
    isSelf: boolean;
    isFriend: boolean;
};

export type AddFriendRequest = {
    friendPlayerId: string;
    inviteCode?: string;
};

export type CreateFriendRequestRequest = {
    friendPlayerId: string;
    inviteCode?: string;
};

export type FriendRequestDto = {
    id: string;
    direction: string;
    status: string;
    playerId: string;
    companyName: string;
    level: number;
    incomePerSecond: number;
    inviteCode: string;
    createdAt: number;
    updatedAt: number;
};

export type FriendActivityDto = {
    id: string;
    activityType: string;
    friendId: string;
    friendName: string;
    createdAt: number;
};

export type LeaderboardEntryDto = {
    playerId: string;
    companyName: string;
    level: number;
    rank: number;
    score: number;
    isSelf: boolean;
    updatedAt: number;
};

export type LeaderboardDto = {
    boardId: string;
    entries: LeaderboardEntryDto[];
    self?: LeaderboardEntryDto;
    serverTime: number;
};

export type SettingsDto = {
    settings: FeatureSaveData["settings"];
};

export type ProductionBuildingPreviewDto = {
    buildingId: string;
    grossCoinPerSecond: number;
    wageCostPerSecond: number;
    netCoinPerSecond: number;
    beanCostPerSecond: number;
};

export type ProductionPreviewRequest = {
    grossCoinPerSecond: number;
    wageCostPerSecond: number;
    beanCostPerSecond: number;
    buildings?: ProductionBuildingPreviewDto[];
    includesClientModifiers?: boolean;
};

export type ProductionPreviewResponse = {
    grossCoinPerSecond: number;
    wageCostPerSecond: number;
    netCoinPerSecond: number;
    beanCostPerSecond: number;
    buildings: ProductionBuildingPreviewDto[];
};

export type LaunchRequest = {
    clientRequestId?: string;
    launchSeconds: number;
    availableBean: number;
    production: ProductionPreviewRequest;
};

export type LaunchResponse = {
    launchId: string;
    accepted: boolean;
    requestedSeconds: number;
    productiveSeconds: number;
    coinGained: number;
    beanSpent: number;
    netCoinPerSecond: number;
    wageCostPerSecond: number;
    beanCostPerSecond: number;
    coinBalance: number;
    beanBalance: number;
    catFoodBalance: number;
    diamondBalance: number;
    researchPointBalance: number;
    serverTime: number;
    rejectedReason?: string;
};

export type BootstrapDto = {
    configVersion: string;
    minClientVersion: number;
    serverFeatures: string[];
};
