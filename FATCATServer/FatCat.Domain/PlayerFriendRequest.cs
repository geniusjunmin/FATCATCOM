namespace FatCat.Domain;

public sealed class PlayerFriendRequest
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid RequesterPlayerId { get; set; }
    public Guid TargetPlayerId { get; set; }
    public string Status { get; set; } = "pending";
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public PlayerProfile? RequesterPlayer { get; set; }
}
