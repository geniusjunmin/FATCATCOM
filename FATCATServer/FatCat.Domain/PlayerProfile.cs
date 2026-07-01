namespace FatCat.Domain;

public sealed class PlayerProfile
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string DeviceId { get; set; } = "";
    public string CompanyName { get; set; } = "肥猫咖啡公司";
    public int Level { get; set; } = 1;
    public int Exp { get; set; }
    public int ExpToNext { get; set; } = 3200;
    public int FriendBoostPercent { get; set; }
    public DateTimeOffset? FriendBoostUntil { get; set; }
    public string FriendBoostedBy { get; set; } = "";
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
