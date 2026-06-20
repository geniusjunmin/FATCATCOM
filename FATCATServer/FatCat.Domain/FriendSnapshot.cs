namespace FatCat.Domain;

public sealed class FriendSnapshot
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PlayerId { get; set; }
    public string FriendKey { get; set; } = "";
    public string Name { get; set; } = "";
    public int Level { get; set; }
    public int IncomePerSecond { get; set; }
    public DateTimeOffset? LastVisitedAt { get; set; }
    public DateTimeOffset? LastGiftAt { get; set; }
    public PlayerProfile? Player { get; set; }
}
