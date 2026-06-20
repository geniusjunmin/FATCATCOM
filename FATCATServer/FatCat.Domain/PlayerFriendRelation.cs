namespace FatCat.Domain;

public sealed class PlayerFriendRelation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PlayerId { get; set; }
    public Guid FriendPlayerId { get; set; }
    public string FriendKey { get; set; } = "";
    public string Status { get; set; } = "accepted";
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public PlayerProfile? Player { get; set; }
}
