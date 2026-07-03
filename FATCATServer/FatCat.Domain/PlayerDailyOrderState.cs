namespace FatCat.Domain;

public sealed class PlayerDailyOrderState
{
    public Guid PlayerId { get; set; }
    public int OrderDate { get; set; }
    public int Progress { get; set; }
    public bool IsClaimed { get; set; }
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public PlayerProfile? Player { get; set; }
}
