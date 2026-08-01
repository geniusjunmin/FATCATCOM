namespace FatCat.Domain;

public sealed class PlayerAchievementClaim
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PlayerId { get; set; }
    public string AchievementKey { get; set; } = "";
    public DateTimeOffset ClaimedAt { get; set; } = DateTimeOffset.UtcNow;
    public PlayerProfile? Player { get; set; }
}
