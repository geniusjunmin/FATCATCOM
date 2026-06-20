namespace FatCat.Domain;

public sealed class PlayerMail
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PlayerId { get; set; }
    public string MailKey { get; set; } = "";
    public string Title { get; set; } = "";
    public string Body { get; set; } = "";
    public int RewardCoin { get; set; }
    public int RewardCatFood { get; set; }
    public int RewardDiamond { get; set; }
    public bool IsClaimed { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? ClaimedAt { get; set; }
    public PlayerProfile? Player { get; set; }
}
