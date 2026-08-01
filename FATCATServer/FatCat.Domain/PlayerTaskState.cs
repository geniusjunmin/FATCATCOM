namespace FatCat.Domain;

public sealed class PlayerTaskState
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PlayerId { get; set; }
    public string TaskKey { get; set; } = "";
    public int CatalogVersion { get; set; }
    public int CycleDate { get; set; }
    public int Progress { get; set; }
    public bool IsClaimed { get; set; }
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public PlayerProfile? Player { get; set; }
}
