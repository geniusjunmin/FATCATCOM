namespace FatCat.Domain;

public sealed class PlayerLaunchRecord
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PlayerId { get; set; }
    public string ClientRequestId { get; set; } = "";
    public string LaunchKey { get; set; } = "";
    public int RequestedSeconds { get; set; }
    public double ProductiveSeconds { get; set; }
    public int CoinGained { get; set; }
    public int BeanSpent { get; set; }
    public double NetCoinPerSecond { get; set; }
    public double WageCostPerSecond { get; set; }
    public double BeanCostPerSecond { get; set; }
    public string EquippedFactoryAppearanceKey { get; set; } = "simple";
    public string ModifierSourcesJson { get; set; } = "[]";
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public PlayerProfile? Player { get; set; }
}
