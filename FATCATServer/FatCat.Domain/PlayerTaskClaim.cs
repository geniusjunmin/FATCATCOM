namespace FatCat.Domain;

public sealed class PlayerTaskClaim
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PlayerId { get; set; }
    public string ClientRequestId { get; set; } = "";
    public string TaskKey { get; set; } = "";
    public int CycleDate { get; set; }
    public double CoinBalance { get; set; }
    public double BeanBalance { get; set; }
    public double CatFoodBalance { get; set; }
    public double DiamondBalance { get; set; }
    public double ResearchPointBalance { get; set; }
    public int ExperienceDelta { get; set; }
    public int PlayerLevelAfter { get; set; }
    public int PlayerExpAfter { get; set; }
    public int PlayerExpToNextAfter { get; set; }
    public int LevelRewardFrom { get; set; }
    public int LevelRewardTo { get; set; }
    public int LevelRewardCoin { get; set; }
    public int LevelRewardDiamond { get; set; }
    public int LevelRewardResearchPoint { get; set; }
    public string InventoryItemsJson { get; set; } = "[]";
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public PlayerProfile? Player { get; set; }
}
