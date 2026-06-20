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
    public DbSet<PlayerSettings> PlayerSettings => Set<PlayerSettings>();
    public DbSet<PlayerResourceState> ResourceStates => Set<PlayerResourceState>();
    public DbSet<PlayerResourceTransaction> ResourceTransactions => Set<PlayerResourceTransaction>();
    public DbSet<PlayerShopPurchaseHistory> ShopPurchaseHistories => Set<PlayerShopPurchaseHistory>();
    public DbSet<PlayerCatState> CatStates => Set<PlayerCatState>();
    public DbSet<PlayerBuildingState> BuildingStates => Set<PlayerBuildingState>();
    public DbSet<PlayerResearchState> ResearchStates => Set<PlayerResearchState>();
    public DbSet<PlayerLaunchRecord> LaunchRecords => Set<PlayerLaunchRecord>();

    public async Task EnsureRuntimeSchemaAsync(CancellationToken cancellationToken = default)
    {
        if (!Database.IsSqlite())
        {
            return;
        }

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
                "CreatedAt" TEXT NOT NULL,
                CONSTRAINT "FK_LaunchRecords_Players_PlayerId" FOREIGN KEY ("PlayerId") REFERENCES "Players" ("Id") ON DELETE CASCADE
            );
            """, cancellationToken);
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
        await Database.ExecuteSqlRawAsync("""
            CREATE UNIQUE INDEX IF NOT EXISTS "IX_CatStates_PlayerId_CatKey"
            ON "CatStates" ("PlayerId", "CatKey");
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
            CREATE TABLE IF NOT EXISTS "ResearchStates" (
                "Id" TEXT NOT NULL CONSTRAINT "PK_ResearchStates" PRIMARY KEY,
                "PlayerId" TEXT NOT NULL,
                "ResearchKey" TEXT NOT NULL,
                "IsUnlocked" INTEGER NOT NULL,
                "UpdatedAt" TEXT NOT NULL,
                CONSTRAINT "FK_ResearchStates_Players_PlayerId" FOREIGN KEY ("PlayerId") REFERENCES "Players" ("Id") ON DELETE CASCADE
            );
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
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<PlayerProfile>(entity =>
        {
            entity.HasKey(player => player.Id);
            entity.HasIndex(player => player.DeviceId).IsUnique();
            entity.Property(player => player.DeviceId).HasMaxLength(160);
            entity.Property(player => player.CompanyName).HasMaxLength(80);
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

        modelBuilder.Entity<PlayerCatState>(entity =>
        {
            entity.HasKey(cat => cat.Id);
            entity.HasIndex(cat => new { cat.PlayerId, cat.CatKey }).IsUnique();
            entity.Property(cat => cat.CatKey).HasMaxLength(80);
            entity.Property(cat => cat.Weight).HasDefaultValue(20);
            entity.Property(cat => cat.AssignedBuildingKey).HasMaxLength(120).HasDefaultValue("building_cafe_1f");
            entity.Property(cat => cat.EquipmentJson).HasColumnType("TEXT");
            entity.Property(cat => cat.EquipmentLevelsJson).HasColumnType("TEXT");
            entity.HasOne(cat => cat.Player)
                .WithMany()
                .HasForeignKey(cat => cat.PlayerId)
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
