namespace FatCat.Domain;

public sealed class PlayerResearchState
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PlayerId { get; set; }
    public string ResearchKey { get; set; } = "";
    public bool IsUnlocked { get; set; }
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public PlayerProfile? Player { get; set; }
}
