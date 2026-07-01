using FatCat.Application;
using FatCat.Domain;
using Microsoft.EntityFrameworkCore;

namespace FatCat.Infrastructure;

public sealed class EfFatCatRepository(FatCatDbContext dbContext) : IFatCatRepository
{
    public Task<PlayerProfile?> FindPlayerByDeviceIdAsync(string deviceId, CancellationToken cancellationToken)
    {
        return dbContext.Players.FirstOrDefaultAsync(player => player.DeviceId == deviceId, cancellationToken);
    }

    public Task<PlayerProfile?> FindPlayerByIdAsync(Guid playerId, CancellationToken cancellationToken)
    {
        return dbContext.Players.FirstOrDefaultAsync(player => player.Id == playerId, cancellationToken);
    }

    public Task<List<PlayerProfile>> FindPlayersByIdsAsync(IReadOnlyCollection<Guid> playerIds, CancellationToken cancellationToken)
    {
        return dbContext.Players
            .Where(player => playerIds.Contains(player.Id))
            .ToListAsync(cancellationToken);
    }

    public async Task AddPlayerAsync(PlayerProfile player, CancellationToken cancellationToken)
    {
        await dbContext.Players.AddAsync(player, cancellationToken);
    }

    public async Task SaveSnapshotAsync(PlayerSaveSnapshot snapshot, CancellationToken cancellationToken)
    {
        await dbContext.SaveSnapshots.AddAsync(snapshot, cancellationToken);
    }

    public Task<PlayerSaveSnapshot?> GetLatestSnapshotAsync(Guid playerId, CancellationToken cancellationToken)
    {
        return dbContext.SaveSnapshots
            .Where(snapshot => snapshot.PlayerId == playerId)
            .OrderByDescending(snapshot => snapshot.SyncedAt)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public Task<List<PlayerMail>> GetMailsAsync(Guid playerId, CancellationToken cancellationToken)
    {
        return dbContext.PlayerMails
            .Where(mail => mail.PlayerId == playerId)
            .ToListAsync(cancellationToken);
    }

    public Task<PlayerMail?> GetMailAsync(Guid playerId, string mailKey, CancellationToken cancellationToken)
    {
        return dbContext.PlayerMails
            .FirstOrDefaultAsync(mail => mail.PlayerId == playerId && mail.MailKey == mailKey, cancellationToken);
    }

    public async Task AddMailAsync(PlayerMail mail, CancellationToken cancellationToken)
    {
        await dbContext.PlayerMails.AddAsync(mail, cancellationToken);
    }

    public Task<List<FriendSnapshot>> GetFriendsAsync(Guid playerId, CancellationToken cancellationToken)
    {
        return dbContext.FriendSnapshots
            .Where(friend => friend.PlayerId == playerId)
            .ToListAsync(cancellationToken);
    }

    public Task<FriendSnapshot?> GetFriendAsync(Guid playerId, string friendKey, CancellationToken cancellationToken)
    {
        return dbContext.FriendSnapshots
            .FirstOrDefaultAsync(friend => friend.PlayerId == playerId && friend.FriendKey == friendKey, cancellationToken);
    }

    public async Task AddFriendAsync(FriendSnapshot friend, CancellationToken cancellationToken)
    {
        await dbContext.FriendSnapshots.AddAsync(friend, cancellationToken);
    }

    public async Task AddFriendIfMissingAsync(FriendSnapshot friend, CancellationToken cancellationToken)
    {
        if (dbContext.Database.IsSqlite())
        {
            await dbContext.Database.ExecuteSqlInterpolatedAsync($"""
                INSERT OR IGNORE INTO "FriendSnapshots"
                    ("Id", "PlayerId", "FriendKey", "Name", "Level", "IncomePerSecond", "LastHelpAt")
                VALUES
                    ({friend.Id}, {friend.PlayerId}, {friend.FriendKey}, {friend.Name}, {friend.Level}, {friend.IncomePerSecond}, {friend.LastHelpAt})
                """, cancellationToken);
            return;
        }

        var exists = await dbContext.FriendSnapshots.AnyAsync(
            item => item.PlayerId == friend.PlayerId && item.FriendKey == friend.FriendKey,
            cancellationToken);
        if (!exists)
        {
            await dbContext.FriendSnapshots.AddAsync(friend, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public Task<PlayerInviteCode?> GetInviteCodeByPlayerIdAsync(Guid playerId, CancellationToken cancellationToken)
    {
        return dbContext.InviteCodes.FirstOrDefaultAsync(invite => invite.PlayerId == playerId, cancellationToken);
    }

    public Task<PlayerInviteCode?> GetInviteCodeByCodeAsync(string code, CancellationToken cancellationToken)
    {
        return dbContext.InviteCodes.FirstOrDefaultAsync(invite => invite.Code == code, cancellationToken);
    }

    public async Task AddInviteCodeAsync(PlayerInviteCode inviteCode, CancellationToken cancellationToken)
    {
        await dbContext.InviteCodes.AddAsync(inviteCode, cancellationToken);
    }

    public Task<PlayerFriendRelation?> GetFriendRelationAsync(Guid playerId, Guid friendPlayerId, CancellationToken cancellationToken)
    {
        return dbContext.FriendRelations.FirstOrDefaultAsync(
            relation => relation.PlayerId == playerId && relation.FriendPlayerId == friendPlayerId,
            cancellationToken);
    }

    public async Task AddFriendRelationAsync(PlayerFriendRelation relation, CancellationToken cancellationToken)
    {
        await dbContext.FriendRelations.AddAsync(relation, cancellationToken);
    }

    public Task<PlayerFriendRequest?> GetFriendRequestAsync(Guid requestId, CancellationToken cancellationToken)
    {
        return dbContext.FriendRequests.FirstOrDefaultAsync(request => request.Id == requestId, cancellationToken);
    }

    public Task<PlayerFriendRequest?> GetFriendRequestBetweenAsync(Guid requesterPlayerId, Guid targetPlayerId, string status, CancellationToken cancellationToken)
    {
        return dbContext.FriendRequests.FirstOrDefaultAsync(
            request => request.RequesterPlayerId == requesterPlayerId
                && request.TargetPlayerId == targetPlayerId
                && request.Status == status,
            cancellationToken);
    }

    public async Task<List<PlayerFriendRequest>> GetFriendRequestsAsync(Guid playerId, string box, CancellationToken cancellationToken)
    {
        var normalized = string.Equals(box, "sent", StringComparison.OrdinalIgnoreCase) ? "sent" : "received";
        var query = dbContext.FriendRequests.AsQueryable();
        query = normalized == "sent"
            ? query.Where(request => request.RequesterPlayerId == playerId)
            : query.Where(request => request.TargetPlayerId == playerId);

        var requests = await query.ToListAsync(cancellationToken);
        return requests
            .OrderByDescending(request => request.UpdatedAt)
            .Take(50)
            .ToList();
    }

    public async Task AddFriendRequestAsync(PlayerFriendRequest request, CancellationToken cancellationToken)
    {
        await dbContext.FriendRequests.AddAsync(request, cancellationToken);
    }

    public async Task AddSocialActivityAsync(PlayerSocialActivity activity, CancellationToken cancellationToken)
    {
        await dbContext.SocialActivities.AddAsync(activity, cancellationToken);
    }

    public async Task<List<PlayerSocialActivity>> GetSocialActivitiesAsync(Guid playerId, int limit, CancellationToken cancellationToken)
    {
        var rows = await dbContext.SocialActivities
            .Where(activity => activity.PlayerId == playerId)
            .ToListAsync(cancellationToken);
        return rows
            .OrderByDescending(activity => activity.CreatedAt)
            .Take(Math.Clamp(limit, 1, 50))
            .ToList();
    }

    public Task<PlayerCoopGoalState?> GetCoopGoalStateAsync(Guid playerId, CancellationToken cancellationToken)
    {
        return dbContext.CoopGoalStates.FirstOrDefaultAsync(state => state.PlayerId == playerId, cancellationToken);
    }

    public async Task AddCoopGoalStateAsync(PlayerCoopGoalState state, CancellationToken cancellationToken)
    {
        await dbContext.CoopGoalStates.AddAsync(state, cancellationToken);
    }

    public async Task<PlayerCoopGoalState> IncrementCoopGoalProgressAsync(
        Guid playerId,
        int goalDate,
        int goalTarget,
        DateTimeOffset now,
        CancellationToken cancellationToken)
    {
        if (dbContext.Database.IsSqlite())
        {
            await dbContext.Database.ExecuteSqlInterpolatedAsync($"""
                INSERT INTO "CoopGoalStates" ("PlayerId", "GoalDate", "Progress", "IsClaimed", "UpdatedAt")
                VALUES ({playerId}, {goalDate}, 1, 0, {now})
                ON CONFLICT ("PlayerId") DO UPDATE SET
                    "GoalDate" = {goalDate},
                    "Progress" = CASE
                        WHEN "GoalDate" = {goalDate} THEN MIN("Progress" + 1, {goalTarget})
                        ELSE 1
                    END,
                    "IsClaimed" = CASE WHEN "GoalDate" = {goalDate} THEN "IsClaimed" ELSE 0 END,
                    "UpdatedAt" = {now};
                """, cancellationToken);
            return await dbContext.CoopGoalStates
                .AsNoTracking()
                .SingleAsync(state => state.PlayerId == playerId, cancellationToken);
        }

        var state = await GetCoopGoalStateAsync(playerId, cancellationToken);
        if (state is null)
        {
            state = new PlayerCoopGoalState
            {
                PlayerId = playerId,
                GoalDate = goalDate,
                Progress = 1,
                UpdatedAt = now,
            };
            await AddCoopGoalStateAsync(state, cancellationToken);
        }
        else
        {
            if (state.GoalDate != goalDate)
            {
                state.GoalDate = goalDate;
                state.Progress = 0;
                state.IsClaimed = false;
            }
            state.Progress = Math.Min(goalTarget, state.Progress + 1);
            state.UpdatedAt = now;
        }
        await dbContext.SaveChangesAsync(cancellationToken);
        return state;
    }

    public async Task<bool> ClaimCoopGoalAsync(
        Guid playerId,
        int goalDate,
        int goalTarget,
        DateTimeOffset now,
        CancellationToken cancellationToken)
    {
        if (!dbContext.Database.IsRelational())
        {
            var state = await GetCoopGoalStateAsync(playerId, cancellationToken);
            if (state is null
                || state.GoalDate != goalDate
                || state.Progress < goalTarget
                || state.IsClaimed)
            {
                return false;
            }
            state.IsClaimed = true;
            state.UpdatedAt = now;
            await dbContext.SaveChangesAsync(cancellationToken);
            return true;
        }

        var updated = await dbContext.CoopGoalStates
            .Where(state => state.PlayerId == playerId
                && state.GoalDate == goalDate
                && state.Progress >= goalTarget
                && !state.IsClaimed)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(state => state.IsClaimed, true)
                .SetProperty(state => state.UpdatedAt, now), cancellationToken);
        return updated == 1;
    }

    public Task<PlayerSettings?> GetSettingsAsync(Guid playerId, CancellationToken cancellationToken)
    {
        return dbContext.PlayerSettings.FirstOrDefaultAsync(settings => settings.PlayerId == playerId, cancellationToken);
    }

    public async Task SetSettingsAsync(PlayerSettings settings, CancellationToken cancellationToken)
    {
        await dbContext.PlayerSettings.AddAsync(settings, cancellationToken);
    }

    public Task<PlayerResourceState?> GetResourceStateAsync(Guid playerId, CancellationToken cancellationToken)
    {
        return dbContext.ResourceStates.FirstOrDefaultAsync(state => state.PlayerId == playerId, cancellationToken);
    }

    public async Task SetResourceStateAsync(PlayerResourceState state, CancellationToken cancellationToken)
    {
        await dbContext.ResourceStates.AddAsync(state, cancellationToken);
    }

    public async Task AddResourceTransactionAsync(PlayerResourceTransaction transaction, CancellationToken cancellationToken)
    {
        await dbContext.ResourceTransactions.AddAsync(transaction, cancellationToken);
    }

    public async Task<List<PlayerResourceTransaction>> GetResourceTransactionsAsync(Guid playerId, int limit, CancellationToken cancellationToken)
    {
        var rows = await dbContext.ResourceTransactions
            .Where(transaction => transaction.PlayerId == playerId)
            .ToListAsync(cancellationToken);
        return rows
            .OrderByDescending(transaction => transaction.CreatedAt)
            .Take(Math.Clamp(limit, 1, 100))
            .ToList();
    }

    public Task<PlayerLaunchRecord?> GetLaunchRecordAsync(Guid playerId, string clientRequestId, CancellationToken cancellationToken)
    {
        return dbContext.LaunchRecords
            .FirstOrDefaultAsync(record => record.PlayerId == playerId && record.ClientRequestId == clientRequestId, cancellationToken);
    }

    public Task<PlayerShopPurchaseHistory?> GetShopPurchaseHistoryAsync(Guid playerId, string shopItemId, int purchaseDate, CancellationToken cancellationToken)
    {
        return dbContext.ShopPurchaseHistories
            .FirstOrDefaultAsync(history => history.PlayerId == playerId && history.ShopItemId == shopItemId && history.PurchaseDate == purchaseDate, cancellationToken);
    }

    public async Task AddShopPurchaseHistoryAsync(PlayerShopPurchaseHistory history, CancellationToken cancellationToken)
    {
        await dbContext.ShopPurchaseHistories.AddAsync(history, cancellationToken);
    }

    public Task<PlayerCatState?> GetCatStateAsync(Guid playerId, string catKey, CancellationToken cancellationToken)
    {
        return dbContext.CatStates
            .FirstOrDefaultAsync(cat => cat.PlayerId == playerId && cat.CatKey == catKey, cancellationToken);
    }

    public Task<List<PlayerCatState>> GetCatStatesAsync(Guid playerId, CancellationToken cancellationToken)
    {
        return dbContext.CatStates
            .Where(cat => cat.PlayerId == playerId)
            .OrderBy(cat => cat.CatKey)
            .ToListAsync(cancellationToken);
    }

    public async Task AddCatStateAsync(PlayerCatState cat, CancellationToken cancellationToken)
    {
        await dbContext.CatStates.AddAsync(cat, cancellationToken);
    }

    public Task<PlayerBuildingState?> GetBuildingStateAsync(Guid playerId, string buildingKey, CancellationToken cancellationToken)
    {
        return dbContext.BuildingStates
            .FirstOrDefaultAsync(building => building.PlayerId == playerId && building.BuildingKey == buildingKey, cancellationToken);
    }

    public Task<List<PlayerBuildingState>> GetBuildingStatesAsync(Guid playerId, CancellationToken cancellationToken)
    {
        return dbContext.BuildingStates
            .Where(building => building.PlayerId == playerId)
            .OrderBy(building => building.BuildingKey)
            .ToListAsync(cancellationToken);
    }

    public async Task AddBuildingStateAsync(PlayerBuildingState building, CancellationToken cancellationToken)
    {
        await dbContext.BuildingStates.AddAsync(building, cancellationToken);
    }

    public Task<List<PlayerDecorState>> GetDecorStatesAsync(Guid playerId, CancellationToken cancellationToken)
    {
        return dbContext.DecorStates
            .Where(decor => decor.PlayerId == playerId)
            .OrderBy(decor => decor.BuildingKey)
            .ThenBy(decor => decor.DecorKey)
            .ToListAsync(cancellationToken);
    }

    public Task<PlayerDecorState?> GetDecorStateAsync(Guid playerId, string decorKey, CancellationToken cancellationToken)
    {
        return dbContext.DecorStates.FirstOrDefaultAsync(
            decor => decor.PlayerId == playerId && decor.DecorKey == decorKey,
            cancellationToken);
    }

    public async Task AddDecorIfMissingAsync(PlayerDecorState decor, CancellationToken cancellationToken)
    {
        if (dbContext.Database.IsSqlite())
        {
            await dbContext.Database.ExecuteSqlInterpolatedAsync($"""
                INSERT OR IGNORE INTO "DecorStates"
                    ("Id", "PlayerId", "DecorKey", "BuildingKey", "Name", "Score", "IsPlaced", "UpdatedAt")
                VALUES
                    ({decor.Id}, {decor.PlayerId}, {decor.DecorKey}, {decor.BuildingKey}, {decor.Name}, {decor.Score}, {decor.IsPlaced}, {decor.UpdatedAt})
                """, cancellationToken);
            return;
        }

        var exists = await dbContext.DecorStates.AnyAsync(
            item => item.PlayerId == decor.PlayerId && item.DecorKey == decor.DecorKey,
            cancellationToken);
        if (!exists)
        {
            await dbContext.DecorStates.AddAsync(decor, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public Task<PlayerResearchState?> GetResearchStateAsync(Guid playerId, string researchKey, CancellationToken cancellationToken)
    {
        return dbContext.ResearchStates
            .FirstOrDefaultAsync(research => research.PlayerId == playerId && research.ResearchKey == researchKey, cancellationToken);
    }

    public Task<List<PlayerResearchState>> GetResearchStatesAsync(Guid playerId, CancellationToken cancellationToken)
    {
        return dbContext.ResearchStates
            .Where(research => research.PlayerId == playerId)
            .OrderBy(research => research.ResearchKey)
            .ToListAsync(cancellationToken);
    }

    public async Task AddResearchStateAsync(PlayerResearchState research, CancellationToken cancellationToken)
    {
        await dbContext.ResearchStates.AddAsync(research, cancellationToken);
    }

    public async Task AddLaunchRecordAsync(PlayerLaunchRecord record, CancellationToken cancellationToken)
    {
        await dbContext.LaunchRecords.AddAsync(record, cancellationToken);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        return dbContext.SaveChangesAsync(cancellationToken);
    }
}
