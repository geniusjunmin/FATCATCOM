namespace FatCat.Domain;

public sealed class PlayerSocialActivity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PlayerId { get; set; }
    public string ActivityType { get; set; } = "";
    public string FriendKey { get; set; } = "";
    public string FriendName { get; set; } = "";
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public PlayerProfile? Player { get; set; }
}
