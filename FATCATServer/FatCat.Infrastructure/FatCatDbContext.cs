using FatCat.Domain;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace FatCat.Infrastructure;

public sealed class FatCatDbContext(DbContextOptions<FatCatDbContext> options) : DbContext(options)
{
    public DbSet<PlayerProfile> Players => Set<PlayerProfile>();
    public DbSet<PlayerSaveSnapshot> SaveSnapshots => Set<PlayerSaveSnapshot>();
    public DbSet<PlayerMail> PlayerMails => Set<PlayerMail>();
    public DbSet<FriendSnapshot> FriendSnapshots => Set<FriendSnapshot>();
    public DbSet<PlayerInviteCode> InviteCodes => Set<PlayerInviteCode>();
    public DbSet<PlayerFriendRelation> FriendRelations => Set<PlayerFriendRelation>();
    public DbSet<PlayerFriendRequest> FriendRequests => Set<PlayerFriendRequest>();
    public DbSet<PlayerSocialActivity> SocialActivities => Set<PlayerSocialActivity>();
    public DbSet<PlayerFriendBoostContribution> FriendBoostContributions => Set<PlayerFriendBoostContribution>();
    public DbSet<PlayerCoopGoalState> CoopGoalStates => Set<PlayerCoopGoalState>();
    public DbSet<PlayerDailyOrderState> DailyOrderStates => Set<PlayerDailyOrderState>();
    public DbSet<PlayerAchievementClaim> AchievementClaims => Set<PlayerAchievementClaim>();
    public DbSet<PlayerSettings> PlayerSettings => Set<PlayerSettings>();
    public DbSet<PlayerResourceState> ResourceStates => Set<PlayerResourceState>();
    public DbSet<PlayerResourceTransaction> ResourceTransactions => Set<PlayerResourceTransaction>();
    public DbSet<PlayerShopPurchaseHistory> ShopPurchaseHistories => Set<PlayerShopPurchaseHistory>();
    public DbSet<PlayerInventoryItem> InventoryItems => Set<PlayerInventoryItem>();
    public DbSet<PlayerInventoryTransaction> InventoryTransactions => Set<PlayerInventoryTransaction>();
    public DbSet<PlayerCatState> CatStates => Set<PlayerCatState>();
    public DbSet<PlayerFactoryAppearanceState> FactoryAppearanceStates => Set<PlayerFactoryAppearanceState>();
    public DbSet<PlayerBuildingState> BuildingStates => Set<PlayerBuildingState>();
    public DbSet<PlayerDecorState> DecorStates => Set<PlayerDecorState>();
    public DbSet<PlayerDecorCollectionState> DecorCollectionStates => Set<PlayerDecorCollectionState>();
    public DbSet<PlayerResearchState> ResearchStates => Set<PlayerResearchState>();
    public DbSet<PlayerLaunchRecord> LaunchRecords => Set<PlayerLaunchRecord>();

    public async Task EnsureRuntimeSchemaAsync(CancellationToken cancellationToken = default)
    {
        if (!Database.IsSqlite())
        {
            return;
        }

        await EnsureSqliteColumnAsync(
            "Players",
            "Level",
            $"""ALTER TABLE "Players" ADD COLUMN "Level" INTEGER NOT NULL DEFAULT {PlayerProgressionRules.InitialLevel};""",
            cancellationToken);
        await EnsureSqliteColumnAsync(
            "Players",
            "Exp",
            $"""ALTER TABLE "Players" ADD COLUMN "Exp" INTEGER NOT NULL DEFAULT {PlayerProgressionRules.InitialExperience};""",
            cancellationToken);
        await EnsureSqliteColumnAsync(
            "Players",
            "ExpToNext",
            $"""ALTER TABLE "Players" ADD COLUMN "ExpToNext" INTEGER NOT NULL DEFAULT {PlayerProgressionRules.GetExperienceToNext(PlayerProgressionRules.InitialLevel)};""",
            cancellationToken);
        await EnsureSqliteColumnAsync(
            "Players",
            "RewardedThroughLevel",
            $"""ALTER TABLE "Players" ADD COLUMN "RewardedThroughLevel" INTEGER NOT NULL DEFAULT {PlayerProgressionRules.InitialLevel};""",
            cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            UPDATE "Players"
            SET "RewardedThroughLevel" = "Level"
            WHERE "RewardedThroughLevel" < "Level";
            """, cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            CREATE TABLE IF NOT EXISTS "ResourceStates" (
                "PlayerId" TEXT NOT NULL CONSTRAINT "PK_ResourceStates" PRIMARY KEY,
                "Coin" REAL NOT NULL,
                "Bean" REAL NOT NULL,
                "CatFood" REAL NOT NULL,
                "Diamond" REAL NOT NULL,
                "ResearchPoint" REAL NOT NULL,
                "UpdatedAt" TEXT NOT NULL,
                CONSTRAINT "FK_ResourceStates_Players_PlayerId" FOREIGN KEY ("PlayerId") REFERENCES "Players" ("Id") ON DELETE CASCADE
            );
            """, cancellationToken);
        await EnsureSqliteColumnAsync(
            "Players",
            "FriendBoostPercent",
            """ALTER TABLE "Players" ADD COLUMN "FriendBoostPercent" INTEGER NOT NULL DEFAULT 0;""",
            cancellationToken);
        await EnsureSqliteColumnAsync(
            "Players",
            "FriendBoostUntil",
            """ALTER TABLE "Players" ADD COLUMN "FriendBoostUntil" TEXT NULL;""",
            cancellationToken);
        await EnsureSqliteColumnAsync(
            "Players",
            "FriendBoostedBy",
            """ALTER TABLE "Players" ADD COLUMN "FriendBoostedBy" TEXT NOT NULL DEFAULT '';""",
            cancellationToken);
        await EnsureSqliteColumnAsync(
            "FriendSnapshots",
            "LastHelpAt",
            """ALTER TABLE "FriendSnapshots" ADD COLUMN "LastHelpAt" TEXT NULL;""",
            cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            CREATE TABLE IF NOT EXISTS "LaunchRecords" (
                "Id" TEXT NOT NULL CONSTRAINT "PK_LaunchRecords" PRIMARY KEY,
                "PlayerId" TEXT NOT NULL,
                "ClientRequestId" TEXT NOT NULL,
                "LaunchKey" TEXT NOT NULL,
                "RequestedSeconds" INTEGER NOT NULL,
                "ProductiveSeconds" REAL NOT NULL,
                "CoinGained" INTEGER NOT NULL,
                "BeanSpent" INTEGER NOT NULL,
                "NetCoinPerSecond" REAL NOT NULL,
                "WageCostPerSecond" REAL NOT NULL,
                "BeanCostPerSecond" REAL NOT NULL,
                "EquippedFactoryAppearanceKey" TEXT NOT NULL DEFAULT 'simple',
                "ModifierSourcesJson" TEXT NOT NULL DEFAULT '[]',
                "ExperienceGained" INTEGER NOT NULL DEFAULT 0,
                "PlayerLevelAfter" INTEGER NOT NULL DEFAULT 0,
                "PlayerExpAfter" INTEGER NOT NULL DEFAULT 0,
                "PlayerExpToNextAfter" INTEGER NOT NULL DEFAULT 0,
                "CreatedAt" TEXT NOT NULL,
                CONSTRAINT "FK_LaunchRecords_Players_PlayerId" FOREIGN KEY ("PlayerId") REFERENCES "Players" ("Id") ON DELETE CASCADE
            );
            """, cancellationToken);
        await EnsureSqliteColumnAsync(
            "LaunchRecords",
            "EquippedFactoryAppearanceKey",
            """ALTER TABLE "LaunchRecords" ADD COLUMN "EquippedFactoryAppearanceKey" TEXT NOT NULL DEFAULT 'simple';""",
            cancellationToken);
        await EnsureSqliteColumnAsync(
            "LaunchRecords",
            "ModifierSourcesJson",
            """ALTER TABLE "LaunchRecords" ADD COLUMN "ModifierSourcesJson" TEXT NOT NULL DEFAULT '[]';""",
            cancellationToken);
        await EnsureSqliteColumnAsync(
            "LaunchRecords",
            "ExperienceGained",
            """ALTER TABLE "LaunchRecords" ADD COLUMN "ExperienceGained" INTEGER NOT NULL DEFAULT 0;""",
            cancellationToken);
        await EnsureSqliteColumnAsync(
            "LaunchRecords",
            "PlayerLevelAfter",
            """ALTER TABLE "LaunchRecords" ADD COLUMN "PlayerLevelAfter" INTEGER NOT NULL DEFAULT 0;""",
            cancellationToken);
        await EnsureSqliteColumnAsync(
            "LaunchRecords",
            "PlayerExpAfter",
            """ALTER TABLE "LaunchRecords" ADD COLUMN "PlayerExpAfter" INTEGER NOT NULL DEFAULT 0;""",
            cancellationToken);
        await EnsureSqliteColumnAsync(
            "LaunchRecords",
            "PlayerExpToNextAfter",
            """ALTER TABLE "LaunchRecords" ADD COLUMN "PlayerExpToNextAfter" INTEGER NOT NULL DEFAULT 0;""",
            cancellationToken);
        await EnsureSqliteColumnAsync(
            "LaunchRecords",
            "LevelRewardFromLevel",
            """ALTER TABLE "LaunchRecords" ADD COLUMN "LevelRewardFromLevel" INTEGER NOT NULL DEFAULT 0;""",
            cancellationToken);
        await EnsureSqliteColumnAsync(
            "LaunchRecords",
            "LevelRewardToLevel",
            """ALTER TABLE "LaunchRecords" ADD COLUMN "LevelRewardToLevel" INTEGER NOT NULL DEFAULT 0;""",
            cancellationToken);
        await EnsureSqliteColumnAsync(
            "LaunchRecords",
            "LevelRewardCoin",
            """ALTER TABLE "LaunchRecords" ADD COLUMN "LevelRewardCoin" INTEGER NOT NULL DEFAULT 0;""",
            cancellationToken);
        await EnsureSqliteColumnAsync(
            "LaunchRecords",
            "LevelRewardDiamond",
            """ALTER TABLE "LaunchRecords" ADD COLUMN "LevelRewardDiamond" INTEGER NOT NULL DEFAULT 0;""",
            cancellationToken);
        await EnsureSqliteColumnAsync(
            "LaunchRecords",
            "LevelRewardResearchPoint",
            """ALTER TABLE "LaunchRecords" ADD COLUMN "LevelRewardResearchPoint" INTEGER NOT NULL DEFAULT 0;""",
            cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            CREATE TABLE IF NOT EXISTS "ResourceTransactions" (
                "Id" TEXT NOT NULL CONSTRAINT "PK_ResourceTransactions" PRIMARY KEY,
                "PlayerId" TEXT NOT NULL,
                "SourceType" TEXT NOT NULL,
                "SourceKey" TEXT NOT NULL,
                "ClientRequestId" TEXT NULL,
                "CoinDelta" REAL NOT NULL,
                "BeanDelta" REAL NOT NULL,
                "CatFoodDelta" REAL NOT NULL,
                "DiamondDelta" REAL NOT NULL,
                "ResearchPointDelta" REAL NOT NULL,
                "CoinBalance" REAL NOT NULL,
                "BeanBalance" REAL NOT NULL,
                "CatFoodBalance" REAL NOT NULL,
                "DiamondBalance" REAL NOT NULL,
                "ResearchPointBalance" REAL NOT NULL,
                "CreatedAt" TEXT NOT NULL,
                CONSTRAINT "FK_ResourceTransactions_Players_PlayerId" FOREIGN KEY ("PlayerId") REFERENCES "Players" ("Id") ON DELETE CASCADE
            );
            """, cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            CREATE INDEX IF NOT EXISTS "IX_ResourceTransactions_PlayerId_CreatedAt"
            ON "ResourceTransactions" ("PlayerId", "CreatedAt");
            """, cancellationToken);
        await EnsureSqliteColumnAsync(
            "ResourceTransactions",
            "ExperienceDelta",
            """ALTER TABLE "ResourceTransactions" ADD COLUMN "ExperienceDelta" INTEGER NOT NULL DEFAULT 0;""",
            cancellationToken);
        await EnsureSqliteColumnAsync(
            "ResourceTransactions",
            "PlayerLevelAfter",
            """ALTER TABLE "ResourceTransactions" ADD COLUMN "PlayerLevelAfter" INTEGER NOT NULL DEFAULT 0;""",
            cancellationToken);
        await EnsureSqliteColumnAsync(
            "ResourceTransactions",
            "PlayerExpAfter",
            """ALTER TABLE "ResourceTransactions" ADD COLUMN "PlayerExpAfter" INTEGER NOT NULL DEFAULT 0;""",
            cancellationToken);
        await EnsureSqliteColumnAsync(
            "ResourceTransactions",
            "PlayerExpToNextAfter",
            """ALTER TABLE "ResourceTransactions" ADD COLUMN "PlayerExpToNextAfter" INTEGER NOT NULL DEFAULT 0;""",
            cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            CREATE TABLE IF NOT EXISTS "AchievementClaims" (
                "Id" TEXT NOT NULL CONSTRAINT "PK_AchievementClaims" PRIMARY KEY,
                "PlayerId" TEXT NOT NULL,
                "AchievementKey" TEXT NOT NULL,
                "ClaimedAt" TEXT NOT NULL,
                CONSTRAINT "FK_AchievementClaims_Players_PlayerId" FOREIGN KEY ("PlayerId") REFERENCES "Players" ("Id") ON DELETE CASCADE
            );
            """, cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            CREATE UNIQUE INDEX IF NOT EXISTS "IX_AchievementClaims_PlayerId_AchievementKey"
            ON "AchievementClaims" ("PlayerId", "AchievementKey");
            """, cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            CREATE TABLE IF NOT EXISTS "ShopPurchaseHistories" (
                "Id" TEXT NOT NULL CONSTRAINT "PK_ShopPurchaseHistories" PRIMARY KEY,
                "PlayerId" TEXT NOT NULL,
                "ShopItemId" TEXT NOT NULL,
                "PurchaseDate" INTEGER NOT NULL,
                "Count" INTEGER NOT NULL,
                "UpdatedAt" TEXT NOT NULL,
                CONSTRAINT "FK_ShopPurchaseHistories_Players_PlayerId" FOREIGN KEY ("PlayerId") REFERENCES "Players" ("Id") ON DELETE CASCADE
            );
            """, cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            CREATE UNIQUE INDEX IF NOT EXISTS "IX_ShopPurchaseHistories_PlayerId_ShopItemId_PurchaseDate"
            ON "ShopPurchaseHistories" ("PlayerId", "ShopItemId", "PurchaseDate");
            """, cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            CREATE TABLE IF NOT EXISTS "InventoryItems" (
                "Id" TEXT NOT NULL CONSTRAINT "PK_InventoryItems" PRIMARY KEY,
                "PlayerId" TEXT NOT NULL,
                "ItemKey" TEXT NOT NULL,
                "Quantity" INTEGER NOT NULL,
                "UpdatedAt" TEXT NOT NULL,
                CONSTRAINT "FK_InventoryItems_Players_PlayerId" FOREIGN KEY ("PlayerId") REFERENCES "Players" ("Id") ON DELETE CASCADE
            );
            """, cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            CREATE UNIQUE INDEX IF NOT EXISTS "IX_InventoryItems_PlayerId_ItemKey"
            ON "InventoryItems" ("PlayerId", "ItemKey");
            """, cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            CREATE TABLE IF NOT EXISTS "InventoryTransactions" (
                "Id" TEXT NOT NULL CONSTRAINT "PK_InventoryTransactions" PRIMARY KEY,
                "PlayerId" TEXT NOT NULL,
                "ClientRequestId" TEXT NOT NULL,
                "SourceType" TEXT NOT NULL,
                "SourceKey" TEXT NOT NULL,
                "ItemKey" TEXT NOT NULL,
                "QuantityDelta" INTEGER NOT NULL,
                "QuantityAfter" INTEGER NOT NULL,
                "RemainingDailyAfter" INTEGER NOT NULL DEFAULT -1,
                "CoinBalance" REAL NOT NULL,
                "BeanBalance" REAL NOT NULL,
                "CatFoodBalance" REAL NOT NULL,
                "DiamondBalance" REAL NOT NULL,
                "ResearchPointBalance" REAL NOT NULL,
                "CreatedAt" TEXT NOT NULL,
                CONSTRAINT "FK_InventoryTransactions_Players_PlayerId" FOREIGN KEY ("PlayerId") REFERENCES "Players" ("Id") ON DELETE CASCADE
            );
            """, cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            CREATE UNIQUE INDEX IF NOT EXISTS "IX_InventoryTransactions_PlayerId_ClientRequestId"
            ON "InventoryTransactions" ("PlayerId", "ClientRequestId");
            """, cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            CREATE INDEX IF NOT EXISTS "IX_InventoryTransactions_PlayerId_CreatedAt"
            ON "InventoryTransactions" ("PlayerId", "CreatedAt");
            """, cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            CREATE TABLE IF NOT EXISTS "CatStates" (
                "Id" TEXT NOT NULL CONSTRAINT "PK_CatStates" PRIMARY KEY,
                "PlayerId" TEXT NOT NULL,
                "CatKey" TEXT NOT NULL,
                "Level" INTEGER NOT NULL,
                "Weight" INTEGER NOT NULL DEFAULT 20,
                "IsUnlocked" INTEGER NOT NULL,
                "AssignedBuildingKey" TEXT NOT NULL DEFAULT 'building_cafe_1f',
                "EquipmentJson" TEXT NOT NULL DEFAULT '{{}}',
                "EquipmentLevelsJson" TEXT NOT NULL DEFAULT '{{}}',
                "OwnedSkinsJson" TEXT NOT NULL DEFAULT '["default"]',
                "EquippedSkinKey" TEXT NOT NULL DEFAULT 'default',
                "UpdatedAt" TEXT NOT NULL,
                CONSTRAINT "FK_CatStates_Players_PlayerId" FOREIGN KEY ("PlayerId") REFERENCES "Players" ("Id") ON DELETE CASCADE
            );
            """, cancellationToken);
        await EnsureSqliteColumnAsync(
            "CatStates",
            "Weight",
            """ALTER TABLE "CatStates" ADD COLUMN "Weight" INTEGER NOT NULL DEFAULT 20;""",
            cancellationToken);
        await EnsureSqliteColumnAsync(
            "CatStates",
            "EquipmentJson",
            """ALTER TABLE "CatStates" ADD COLUMN "EquipmentJson" TEXT NOT NULL DEFAULT '{{}}';""",
            cancellationToken);
        await EnsureSqliteColumnAsync(
            "CatStates",
            "AssignedBuildingKey",
            """ALTER TABLE "CatStates" ADD COLUMN "AssignedBuildingKey" TEXT NOT NULL DEFAULT 'building_cafe_1f';""",
            cancellationToken);
        await EnsureSqliteColumnAsync(
            "CatStates",
            "EquipmentLevelsJson",
            """ALTER TABLE "CatStates" ADD COLUMN "EquipmentLevelsJson" TEXT NOT NULL DEFAULT '{{}}';""",
            cancellationToken);
        await EnsureSqliteColumnAsync(
            "CatStates",
            "OwnedSkinsJson",
            """ALTER TABLE "CatStates" ADD COLUMN "OwnedSkinsJson" TEXT NOT NULL DEFAULT '["default"]';""",
            cancellationToken);
        await EnsureSqliteColumnAsync(
            "CatStates",
            "EquippedSkinKey",
            """ALTER TABLE "CatStates" ADD COLUMN "EquippedSkinKey" TEXT NOT NULL DEFAULT 'default';""",
            cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            CREATE UNIQUE INDEX IF NOT EXISTS "IX_CatStates_PlayerId_CatKey"
            ON "CatStates" ("PlayerId", "CatKey");
            """, cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            CREATE TABLE IF NOT EXISTS "FactoryAppearanceStates" (
                "PlayerId" TEXT NOT NULL CONSTRAINT "PK_FactoryAppearanceStates" PRIMARY KEY,
                "OwnedAppearanceIdsJson" TEXT NOT NULL DEFAULT '["simple"]',
                "EquippedAppearanceKey" TEXT NOT NULL DEFAULT 'simple',
                "UpdatedAt" TEXT NOT NULL,
                CONSTRAINT "FK_FactoryAppearanceStates_Players_PlayerId" FOREIGN KEY ("PlayerId") REFERENCES "Players" ("Id") ON DELETE CASCADE
            );
            """, cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            CREATE TABLE IF NOT EXISTS "BuildingStates" (
                "Id" TEXT NOT NULL CONSTRAINT "PK_BuildingStates" PRIMARY KEY,
                "PlayerId" TEXT NOT NULL,
                "BuildingKey" TEXT NOT NULL,
                "Level" INTEGER NOT NULL,
                "UpdatedAt" TEXT NOT NULL,
                CONSTRAINT "FK_BuildingStates_Players_PlayerId" FOREIGN KEY ("PlayerId") REFERENCES "Players" ("Id") ON DELETE CASCADE
            );
            """, cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            CREATE UNIQUE INDEX IF NOT EXISTS "IX_BuildingStates_PlayerId_BuildingKey"
            ON "BuildingStates" ("PlayerId", "BuildingKey");
            """, cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            CREATE TABLE IF NOT EXISTS "DecorStates" (
                "Id" TEXT NOT NULL CONSTRAINT "PK_DecorStates" PRIMARY KEY,
                "PlayerId" TEXT NOT NULL,
                "DecorKey" TEXT NOT NULL,
                "BuildingKey" TEXT NOT NULL,
                "Name" TEXT NOT NULL,
                "Score" INTEGER NOT NULL,
                "IsPlaced" INTEGER NOT NULL,
                "UpdatedAt" TEXT NOT NULL,
                CONSTRAINT "FK_DecorStates_Players_PlayerId" FOREIGN KEY ("PlayerId") REFERENCES "Players" ("Id") ON DELETE CASCADE
            );
            """, cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            CREATE UNIQUE INDEX IF NOT EXISTS "IX_DecorStates_PlayerId_DecorKey"
            ON "DecorStates" ("PlayerId", "DecorKey");
            """, cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            CREATE INDEX IF NOT EXISTS "IX_DecorStates_PlayerId_BuildingKey"
            ON "DecorStates" ("PlayerId", "BuildingKey");
            """, cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            CREATE TABLE IF NOT EXISTS "DecorCollectionStates" (
                "PlayerId" TEXT NOT NULL CONSTRAINT "PK_DecorCollectionStates" PRIMARY KEY,
                "ClaimedTierMask" INTEGER NOT NULL,
                "UpdatedAt" TEXT NOT NULL,
                CONSTRAINT "FK_DecorCollectionStates_Players_PlayerId" FOREIGN KEY ("PlayerId") REFERENCES "Players" ("Id") ON DELETE CASCADE
            );
            """, cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            CREATE TABLE IF NOT EXISTS "ResearchStates" (
                "Id" TEXT NOT NULL CONSTRAINT "PK_ResearchStates" PRIMARY KEY,
                "PlayerId" TEXT NOT NULL,
                "ResearchKey" TEXT NOT NULL,
                "IsUnlocked" INTEGER NOT NULL,
                "Level" INTEGER NOT NULL DEFAULT 0,
                "UpdatedAt" TEXT NOT NULL,
                CONSTRAINT "FK_ResearchStates_Players_PlayerId" FOREIGN KEY ("PlayerId") REFERENCES "Players" ("Id") ON DELETE CASCADE
            );
            """, cancellationToken);
        await EnsureSqliteColumnAsync(
            "ResearchStates",
            "Level",
            """ALTER TABLE "ResearchStates" ADD COLUMN "Level" INTEGER NOT NULL DEFAULT 0;""",
            cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            UPDATE "ResearchStates"
            SET "Level" = 1
            WHERE "IsUnlocked" = 1 AND "Level" = 0;
            """, cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            CREATE UNIQUE INDEX IF NOT EXISTS "IX_ResearchStates_PlayerId_ResearchKey"
            ON "ResearchStates" ("PlayerId", "ResearchKey");
            """, cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            CREATE UNIQUE INDEX IF NOT EXISTS "IX_LaunchRecords_PlayerId_ClientRequestId"
            ON "LaunchRecords" ("PlayerId", "ClientRequestId");
            """, cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            CREATE INDEX IF NOT EXISTS "IX_LaunchRecords_PlayerId_CreatedAt"
            ON "LaunchRecords" ("PlayerId", "CreatedAt");
            """, cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            CREATE TABLE IF NOT EXISTS "SocialActivities" (
                "Id" TEXT NOT NULL CONSTRAINT "PK_SocialActivities" PRIMARY KEY,
                "PlayerId" TEXT NOT NULL,
                "ActivityType" TEXT NOT NULL,
                "FriendKey" TEXT NOT NULL,
                "FriendName" TEXT NOT NULL,
                "CreatedAt" TEXT NOT NULL,
                CONSTRAINT "FK_SocialActivities_Players_PlayerId" FOREIGN KEY ("PlayerId") REFERENCES "Players" ("Id") ON DELETE CASCADE
            );
            """, cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            CREATE TABLE IF NOT EXISTS "CoopGoalStates" (
                "PlayerId" TEXT NOT NULL CONSTRAINT "PK_CoopGoalStates" PRIMARY KEY,
                "GoalDate" INTEGER NOT NULL,
                "Progress" INTEGER NOT NULL,
                "IsClaimed" INTEGER NOT NULL,
                "ClaimedTierMask" INTEGER NOT NULL DEFAULT 0,
                "UpdatedAt" TEXT NOT NULL,
                CONSTRAINT "FK_CoopGoalStates_Players_PlayerId" FOREIGN KEY ("PlayerId") REFERENCES "Players" ("Id") ON DELETE CASCADE
            );
            """, cancellationToken);
        await EnsureSqliteColumnAsync(
            "CoopGoalStates",
            "ClaimedTierMask",
            """ALTER TABLE "CoopGoalStates" ADD COLUMN "ClaimedTierMask" INTEGER NOT NULL DEFAULT 0;""",
            cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            CREATE TABLE IF NOT EXISTS "DailyOrderStates" (
                "PlayerId" TEXT NOT NULL CONSTRAINT "PK_DailyOrderStates" PRIMARY KEY,
                "OrderDate" INTEGER NOT NULL,
                "Progress" INTEGER NOT NULL,
                "LaunchCount" INTEGER NOT NULL DEFAULT 0,
                "IsClaimed" INTEGER NOT NULL,
                "UpdatedAt" TEXT NOT NULL,
                CONSTRAINT "FK_DailyOrderStates_Players_PlayerId" FOREIGN KEY ("PlayerId") REFERENCES "Players" ("Id") ON DELETE CASCADE
            );
            """, cancellationToken);
        await EnsureSqliteColumnAsync(
            "DailyOrderStates",
            "LaunchCount",
            """ALTER TABLE "DailyOrderStates" ADD COLUMN "LaunchCount" INTEGER NOT NULL DEFAULT 0;""",
            cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            CREATE TABLE IF NOT EXISTS "FriendBoostContributions" (
                "Id" TEXT NOT NULL CONSTRAINT "PK_FriendBoostContributions" PRIMARY KEY,
                "PlayerId" TEXT NOT NULL,
                "SourcePlayerId" TEXT NOT NULL,
                "SourceName" TEXT NOT NULL,
                "BoostPercent" INTEGER NOT NULL,
                "CreatedAt" TEXT NOT NULL,
                "ExpiresAt" TEXT NOT NULL,
                CONSTRAINT "FK_FriendBoostContributions_Players_PlayerId" FOREIGN KEY ("PlayerId") REFERENCES "Players" ("Id") ON DELETE CASCADE
            );
            """, cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            CREATE INDEX IF NOT EXISTS "IX_FriendBoostContributions_PlayerId_CreatedAt"
            ON "FriendBoostContributions" ("PlayerId", "CreatedAt");
            """, cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            CREATE INDEX IF NOT EXISTS "IX_SocialActivities_PlayerId_CreatedAt"
            ON "SocialActivities" ("PlayerId", "CreatedAt");
            """, cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            CREATE TABLE IF NOT EXISTS "InviteCodes" (
                "Id" TEXT NOT NULL CONSTRAINT "PK_InviteCodes" PRIMARY KEY,
                "PlayerId" TEXT NOT NULL,
                "Code" TEXT NOT NULL,
                "CreatedAt" TEXT NOT NULL,
                "UpdatedAt" TEXT NOT NULL,
                CONSTRAINT "FK_InviteCodes_Players_PlayerId" FOREIGN KEY ("PlayerId") REFERENCES "Players" ("Id") ON DELETE CASCADE
            );
            """, cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            CREATE UNIQUE INDEX IF NOT EXISTS "IX_InviteCodes_PlayerId"
            ON "InviteCodes" ("PlayerId");
            """, cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            CREATE UNIQUE INDEX IF NOT EXISTS "IX_InviteCodes_Code"
            ON "InviteCodes" ("Code");
            """, cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            CREATE TABLE IF NOT EXISTS "FriendRelations" (
                "Id" TEXT NOT NULL CONSTRAINT "PK_FriendRelations" PRIMARY KEY,
                "PlayerId" TEXT NOT NULL,
                "FriendPlayerId" TEXT NOT NULL,
                "FriendKey" TEXT NOT NULL,
                "Status" TEXT NOT NULL,
                "CreatedAt" TEXT NOT NULL,
                "UpdatedAt" TEXT NOT NULL,
                CONSTRAINT "FK_FriendRelations_Players_PlayerId" FOREIGN KEY ("PlayerId") REFERENCES "Players" ("Id") ON DELETE CASCADE
            );
            """, cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            CREATE UNIQUE INDEX IF NOT EXISTS "IX_FriendRelations_PlayerId_FriendPlayerId"
            ON "FriendRelations" ("PlayerId", "FriendPlayerId");
            """, cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            CREATE TABLE IF NOT EXISTS "FriendRequests" (
                "Id" TEXT NOT NULL CONSTRAINT "PK_FriendRequests" PRIMARY KEY,
                "RequesterPlayerId" TEXT NOT NULL,
                "TargetPlayerId" TEXT NOT NULL,
                "Status" TEXT NOT NULL,
                "CreatedAt" TEXT NOT NULL,
                "UpdatedAt" TEXT NOT NULL,
                CONSTRAINT "FK_FriendRequests_Players_RequesterPlayerId" FOREIGN KEY ("RequesterPlayerId") REFERENCES "Players" ("Id") ON DELETE CASCADE
            );
            """, cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            CREATE UNIQUE INDEX IF NOT EXISTS "IX_FriendRequests_RequesterPlayerId_TargetPlayerId_Status"
            ON "FriendRequests" ("RequesterPlayerId", "TargetPlayerId", "Status");
            """, cancellationToken);
        await Database.ExecuteSqlRawAsync("""
            CREATE INDEX IF NOT EXISTS "IX_FriendRequests_TargetPlayerId_Status"
            ON "FriendRequests" ("TargetPlayerId", "Status");
            """, cancellationToken);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<PlayerProfile>(entity =>
        {
            entity.HasKey(player => player.Id);
            entity.HasIndex(player => player.DeviceId).IsUnique();
            entity.Property(player => player.DeviceId).HasMaxLength(160);
            entity.Property(player => player.CompanyName).HasMaxLength(80);
            entity.Property(player => player.FriendBoostedBy).HasMaxLength(80);
            entity.Property(player => player.Level).HasDefaultValue(PlayerProgressionRules.InitialLevel);
            entity.Property(player => player.Exp).HasDefaultValue(PlayerProgressionRules.InitialExperience);
            entity.Property(player => player.ExpToNext).HasDefaultValue(PlayerProgressionRules.GetExperienceToNext(PlayerProgressionRules.InitialLevel));
            entity.Property(player => player.RewardedThroughLevel).HasDefaultValue(PlayerProgressionRules.InitialLevel);
        });

        modelBuilder.Entity<PlayerSaveSnapshot>(entity =>
        {
            entity.HasKey(snapshot => snapshot.Id);
            entity.HasIndex(snapshot => new { snapshot.PlayerId, snapshot.SyncedAt });
            entity.Property(snapshot => snapshot.SaveJson).HasColumnType("TEXT");
            entity.HasOne(snapshot => snapshot.Player)
                .WithMany()
                .HasForeignKey(snapshot => snapshot.PlayerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PlayerMail>(entity =>
        {
            entity.HasKey(mail => mail.Id);
            entity.HasIndex(mail => new { mail.PlayerId, mail.MailKey }).IsUnique();
            entity.Property(mail => mail.MailKey).HasMaxLength(80);
            entity.Property(mail => mail.Title).HasMaxLength(120);
            entity.Property(mail => mail.Body).HasMaxLength(1000);
            entity.HasOne(mail => mail.Player)
                .WithMany()
                .HasForeignKey(mail => mail.PlayerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<FriendSnapshot>(entity =>
        {
            entity.HasKey(friend => friend.Id);
            entity.HasIndex(friend => new { friend.PlayerId, friend.FriendKey }).IsUnique();
            entity.Property(friend => friend.FriendKey).HasMaxLength(80);
            entity.Property(friend => friend.Name).HasMaxLength(80);
            entity.HasOne(friend => friend.Player)
                .WithMany()
                .HasForeignKey(friend => friend.PlayerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PlayerSocialActivity>(entity =>
        {
            entity.HasKey(activity => activity.Id);
            entity.HasIndex(activity => new { activity.PlayerId, activity.CreatedAt });
            entity.Property(activity => activity.ActivityType).HasMaxLength(80);
            entity.Property(activity => activity.FriendKey).HasMaxLength(120);
            entity.Property(activity => activity.FriendName).HasMaxLength(80);
            entity.HasOne(activity => activity.Player)
                .WithMany()
                .HasForeignKey(activity => activity.PlayerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PlayerFriendBoostContribution>(entity =>
        {
            entity.HasKey(contribution => contribution.Id);
            entity.HasIndex(contribution => new { contribution.PlayerId, contribution.CreatedAt });
            entity.Property(contribution => contribution.SourceName).HasMaxLength(80);
            entity.HasOne(contribution => contribution.Player)
                .WithMany()
                .HasForeignKey(contribution => contribution.PlayerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PlayerCoopGoalState>(entity =>
        {
            entity.HasKey(state => state.PlayerId);
            entity.HasOne(state => state.Player)
                .WithOne()
                .HasForeignKey<PlayerCoopGoalState>(state => state.PlayerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PlayerDailyOrderState>(entity =>
        {
            entity.HasKey(state => state.PlayerId);
            entity.HasOne(state => state.Player)
                .WithOne()
                .HasForeignKey<PlayerDailyOrderState>(state => state.PlayerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PlayerAchievementClaim>(entity =>
        {
            entity.HasKey(claim => claim.Id);
            entity.HasIndex(claim => new { claim.PlayerId, claim.AchievementKey }).IsUnique();
            entity.Property(claim => claim.AchievementKey).HasMaxLength(120);
            entity.HasOne(claim => claim.Player)
                .WithMany()
                .HasForeignKey(claim => claim.PlayerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PlayerInviteCode>(entity =>
        {
            entity.HasKey(invite => invite.Id);
            entity.HasIndex(invite => invite.PlayerId).IsUnique();
            entity.HasIndex(invite => invite.Code).IsUnique();
            entity.Property(invite => invite.Code).HasMaxLength(20);
            entity.HasOne(invite => invite.Player)
                .WithMany()
                .HasForeignKey(invite => invite.PlayerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PlayerFriendRelation>(entity =>
        {
            entity.HasKey(relation => relation.Id);
            entity.HasIndex(relation => new { relation.PlayerId, relation.FriendPlayerId }).IsUnique();
            entity.Property(relation => relation.FriendKey).HasMaxLength(120);
            entity.Property(relation => relation.Status).HasMaxLength(40);
            entity.HasOne(relation => relation.Player)
                .WithMany()
                .HasForeignKey(relation => relation.PlayerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PlayerFriendRequest>(entity =>
        {
            entity.HasKey(request => request.Id);
            entity.HasIndex(request => new { request.RequesterPlayerId, request.TargetPlayerId, request.Status }).IsUnique();
            entity.HasIndex(request => new { request.TargetPlayerId, request.Status });
            entity.Property(request => request.Status).HasMaxLength(40);
            entity.HasOne(request => request.RequesterPlayer)
                .WithMany()
                .HasForeignKey(request => request.RequesterPlayerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PlayerSettings>(entity =>
        {
            entity.HasKey(settings => settings.PlayerId);
            entity.Property(settings => settings.SettingsJson).HasColumnType("TEXT");
            entity.HasOne(settings => settings.Player)
                .WithOne()
                .HasForeignKey<PlayerSettings>(settings => settings.PlayerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PlayerResourceState>(entity =>
        {
            entity.HasKey(state => state.PlayerId);
            entity.HasOne(state => state.Player)
                .WithOne()
                .HasForeignKey<PlayerResourceState>(state => state.PlayerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PlayerLaunchRecord>(entity =>
        {
            entity.HasKey(record => record.Id);
            entity.HasIndex(record => new { record.PlayerId, record.ClientRequestId }).IsUnique();
            entity.HasIndex(record => new { record.PlayerId, record.CreatedAt });
            entity.Property(record => record.ClientRequestId).HasMaxLength(120);
            entity.Property(record => record.LaunchKey).HasMaxLength(160);
            entity.Property(record => record.EquippedFactoryAppearanceKey).HasMaxLength(80).HasDefaultValue("simple");
            entity.Property(record => record.ModifierSourcesJson).HasColumnType("TEXT");
            entity.HasOne(record => record.Player)
                .WithMany()
                .HasForeignKey(record => record.PlayerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PlayerResourceTransaction>(entity =>
        {
            entity.HasKey(transaction => transaction.Id);
            entity.HasIndex(transaction => new { transaction.PlayerId, transaction.CreatedAt });
            entity.Property(transaction => transaction.SourceType).HasMaxLength(80);
            entity.Property(transaction => transaction.SourceKey).HasMaxLength(160);
            entity.Property(transaction => transaction.ClientRequestId).HasMaxLength(120);
            entity.HasOne(transaction => transaction.Player)
                .WithMany()
                .HasForeignKey(transaction => transaction.PlayerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PlayerShopPurchaseHistory>(entity =>
        {
            entity.HasKey(history => history.Id);
            entity.HasIndex(history => new { history.PlayerId, history.ShopItemId, history.PurchaseDate }).IsUnique();
            entity.Property(history => history.ShopItemId).HasMaxLength(120);
            entity.HasOne(history => history.Player)
                .WithMany()
                .HasForeignKey(history => history.PlayerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PlayerInventoryItem>(entity =>
        {
            entity.HasKey(item => item.Id);
            entity.HasIndex(item => new { item.PlayerId, item.ItemKey }).IsUnique();
            entity.Property(item => item.ItemKey).HasMaxLength(120);
            entity.HasOne(item => item.Player)
                .WithMany()
                .HasForeignKey(item => item.PlayerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PlayerInventoryTransaction>(entity =>
        {
            entity.HasKey(transaction => transaction.Id);
            entity.HasIndex(transaction => new { transaction.PlayerId, transaction.ClientRequestId }).IsUnique();
            entity.HasIndex(transaction => new { transaction.PlayerId, transaction.CreatedAt });
            entity.Property(transaction => transaction.ClientRequestId).HasMaxLength(120);
            entity.Property(transaction => transaction.SourceType).HasMaxLength(80);
            entity.Property(transaction => transaction.SourceKey).HasMaxLength(160);
            entity.Property(transaction => transaction.ItemKey).HasMaxLength(120);
            entity.HasOne(transaction => transaction.Player)
                .WithMany()
                .HasForeignKey(transaction => transaction.PlayerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PlayerCatState>(entity =>
        {
            entity.HasKey(cat => cat.Id);
            entity.HasIndex(cat => new { cat.PlayerId, cat.CatKey }).IsUnique();
            entity.Property(cat => cat.CatKey).HasMaxLength(80);
            entity.Property(cat => cat.Weight).HasDefaultValue(20);
            entity.Property(cat => cat.AssignedBuildingKey).HasMaxLength(120).HasDefaultValue("building_cafe_1f");
            entity.Property(cat => cat.EquipmentJson).HasColumnType("TEXT");
            entity.Property(cat => cat.EquipmentLevelsJson).HasColumnType("TEXT");
            entity.Property(cat => cat.OwnedSkinsJson).HasColumnType("TEXT");
            entity.Property(cat => cat.EquippedSkinKey).HasMaxLength(80).HasDefaultValue("default");
            entity.HasOne(cat => cat.Player)
                .WithMany()
                .HasForeignKey(cat => cat.PlayerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PlayerFactoryAppearanceState>(entity =>
        {
            entity.HasKey(state => state.PlayerId);
            entity.Property(state => state.OwnedAppearanceIdsJson).HasColumnType("TEXT");
            entity.Property(state => state.EquippedAppearanceKey).HasMaxLength(80).HasDefaultValue("simple");
            entity.HasOne(state => state.Player)
                .WithOne()
                .HasForeignKey<PlayerFactoryAppearanceState>(state => state.PlayerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PlayerBuildingState>(entity =>
        {
            entity.HasKey(building => building.Id);
            entity.HasIndex(building => new { building.PlayerId, building.BuildingKey }).IsUnique();
            entity.Property(building => building.BuildingKey).HasMaxLength(120);
            entity.HasOne(building => building.Player)
                .WithMany()
                .HasForeignKey(building => building.PlayerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PlayerDecorState>(entity =>
        {
            entity.HasKey(decor => decor.Id);
            entity.HasIndex(decor => new { decor.PlayerId, decor.DecorKey }).IsUnique();
            entity.HasIndex(decor => new { decor.PlayerId, decor.BuildingKey });
            entity.Property(decor => decor.DecorKey).HasMaxLength(120);
            entity.Property(decor => decor.BuildingKey).HasMaxLength(120);
            entity.Property(decor => decor.Name).HasMaxLength(120);
            entity.HasOne(decor => decor.Player)
                .WithMany()
                .HasForeignKey(decor => decor.PlayerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PlayerDecorCollectionState>(entity =>
        {
            entity.HasKey(state => state.PlayerId);
            entity.HasOne(state => state.Player)
                .WithOne()
                .HasForeignKey<PlayerDecorCollectionState>(state => state.PlayerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PlayerResearchState>(entity =>
        {
            entity.HasKey(research => research.Id);
            entity.HasIndex(research => new { research.PlayerId, research.ResearchKey }).IsUnique();
            entity.Property(research => research.ResearchKey).HasMaxLength(120);
            entity.HasOne(research => research.Player)
                .WithMany()
                .HasForeignKey(research => research.PlayerId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }

    private async Task EnsureSqliteColumnAsync(
        string tableName,
        string columnName,
        string alterSql,
        CancellationToken cancellationToken)
    {
        var connection = Database.GetDbConnection();
        var shouldClose = connection.State != ConnectionState.Open;
        if (shouldClose)
        {
            await connection.OpenAsync(cancellationToken);
        }

        try
        {
            await using var command = connection.CreateCommand();
            command.CommandText = $"""PRAGMA table_info("{tableName.Replace("\"", "\"\"")}")""";
            await using var reader = await command.ExecuteReaderAsync(cancellationToken);
            while (await reader.ReadAsync(cancellationToken))
            {
                if (string.Equals(reader.GetString(1), columnName, StringComparison.OrdinalIgnoreCase))
                {
                    return;
                }
            }

            await Database.ExecuteSqlRawAsync(alterSql, cancellationToken);
        }
        finally
        {
            if (shouldClose)
            {
                await connection.CloseAsync();
            }
        }
    }
}
