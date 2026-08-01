namespace FatCat.Domain;

public sealed class PlayerProfile
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string DeviceId { get; set; } = "";
    public string CompanyName { get; set; } = "肥猫咖啡公司";
    public int Level { get; set; } = PlayerProgressionRules.InitialLevel;
    public int Exp { get; set; } = PlayerProgressionRules.InitialExperience;
    public int ExpToNext { get; set; } = PlayerProgressionRules.GetExperienceToNext(PlayerProgressionRules.InitialLevel);
    public int RewardedThroughLevel { get; set; } = PlayerProgressionRules.InitialLevel;
    public int FriendBoostPercent { get; set; }
    public DateTimeOffset? FriendBoostUntil { get; set; }
    public string FriendBoostedBy { get; set; } = "";
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
