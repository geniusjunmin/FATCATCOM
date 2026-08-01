namespace FatCat.Domain;

public sealed class PlayerInventoryTransaction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PlayerId { get; set; }
    public string ClientRequestId { get; set; } = "";
    public string SourceType { get; set; } = "";
    public string SourceKey { get; set; } = "";
    public string ItemKey { get; set; } = "";
    public int QuantityDelta { get; set; }
    public int QuantityAfter { get; set; }
    public int RemainingDailyAfter { get; set; } = -1;
    public double CoinBalance { get; set; }
    public double BeanBalance { get; set; }
    public double CatFoodBalance { get; set; }
    public double DiamondBalance { get; set; }
    public double ResearchPointBalance { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public PlayerProfile? Player { get; set; }
}
