namespace FatCat.Domain;

public sealed class PlayerFriendBoostContribution
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PlayerId { get; set; }
    public Guid SourcePlayerId { get; set; }
    public string SourceName { get; set; } = "";
    public int BoostPercent { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset ExpiresAt { get; set; }
    public PlayerProfile? Player { get; set; }
}
