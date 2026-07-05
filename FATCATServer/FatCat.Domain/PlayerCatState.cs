namespace FatCat.Domain;

public sealed class PlayerCatState
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PlayerId { get; set; }
    public string CatKey { get; set; } = "";
    public int Level { get; set; } = 1;
    public int Weight { get; set; } = 20;
    public bool IsUnlocked { get; set; }
    public string AssignedBuildingKey { get; set; } = "building_cafe_1f";
    public string EquipmentJson { get; set; } = "{}";
    public string EquipmentLevelsJson { get; set; } = "{}";
    public string OwnedSkinsJson { get; set; } = "[\"default\"]";
    public string EquippedSkinKey { get; set; } = "default";
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public PlayerProfile? Player { get; set; }
}
