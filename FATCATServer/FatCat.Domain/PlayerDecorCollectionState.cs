namespace FatCat.Domain;

public sealed class PlayerDecorCollectionState
{
    public Guid PlayerId { get; set; }
    public int ClaimedTierMask { get; set; }
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public PlayerProfile? Player { get; set; }
}
