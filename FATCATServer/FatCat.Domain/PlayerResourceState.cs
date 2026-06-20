namespace FatCat.Domain;

public sealed class PlayerResourceState
{
    public Guid PlayerId { get; set; }
    public double Coin { get; set; }
    public double Bean { get; set; }
    public double CatFood { get; set; }
    public double Diamond { get; set; }
    public double ResearchPoint { get; set; }
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public PlayerProfile? Player { get; set; }
}
