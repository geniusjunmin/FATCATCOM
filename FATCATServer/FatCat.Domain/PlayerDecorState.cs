namespace FatCat.Domain;

public sealed class PlayerDecorState
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PlayerId { get; set; }
    public string DecorKey { get; set; } = "";
    public string BuildingKey { get; set; } = "";
    public string Name { get; set; } = "";
    public int Score { get; set; }
    public bool IsPlaced { get; set; } = true;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public PlayerProfile? Player { get; set; }
}
