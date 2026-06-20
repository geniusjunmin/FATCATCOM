namespace FatCat.Domain;

public sealed class PlayerSettings
{
    public Guid PlayerId { get; set; }
    public string SettingsJson { get; set; } = "{}";
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public PlayerProfile? Player { get; set; }
}
