namespace FatCat.Domain;

public sealed class PlayerCoopGoalState
{
    public Guid PlayerId { get; set; }
    public int GoalDate { get; set; }
    public int Progress { get; set; }
    public bool IsClaimed { get; set; }
    public int ClaimedTierMask { get; set; }
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public PlayerProfile? Player { get; set; }
}
