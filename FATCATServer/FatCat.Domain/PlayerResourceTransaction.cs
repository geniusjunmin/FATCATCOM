namespace FatCat.Domain;

public sealed class PlayerResourceTransaction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PlayerId { get; set; }
    public string SourceType { get; set; } = "";
    public string SourceKey { get; set; } = "";
    public string? ClientRequestId { get; set; }
    public double CoinDelta { get; set; }
    public double BeanDelta { get; set; }
    public double CatFoodDelta { get; set; }
    public double DiamondDelta { get; set; }
    public double ResearchPointDelta { get; set; }
    public double CoinBalance { get; set; }
    public double BeanBalance { get; set; }
    public double CatFoodBalance { get; set; }
    public double DiamondBalance { get; set; }
    public double ResearchPointBalance { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public PlayerProfile? Player { get; set; }
}
