namespace FatCat.Domain;

public sealed class PlayerFactoryAppearanceState
{
    public Guid PlayerId { get; set; }
    public string OwnedAppearanceIdsJson { get; set; } = "[\"simple\"]";
    public string EquippedAppearanceKey { get; set; } = "simple";
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public PlayerProfile? Player { get; set; }
}
