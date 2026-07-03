using System.Text.Json;

namespace FatCat.Application;

public sealed class BalanceConfig
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public BalanceConfig(
        IReadOnlyDictionary<string, ResearchDefinition> researchDefinitions,
        IReadOnlyDictionary<string, EquipmentDefinition> equipmentDefinitions,
        IReadOnlyDictionary<string, string> defaultEquipment,
        IReadOnlyDictionary<string, BuildingDefinition>? buildingDefinitions = null,
        IReadOnlyDictionary<string, CatDefinition>? catDefinitions = null,
        IReadOnlyDictionary<string, SkillDefinition>? skillDefinitions = null)
    {
        ResearchDefinitions = researchDefinitions;
        EquipmentDefinitions = equipmentDefinitions;
        DefaultEquipment = defaultEquipment;
        BuildingDefinitions = buildingDefinitions ?? CreateDefaultBuildingDefinitions();
        CatDefinitions = catDefinitions ?? CreateDefaultCatDefinitions();
        SkillDefinitions = skillDefinitions ?? CreateDefaultSkillDefinitions();
        Validate();
    }

    public IReadOnlyDictionary<string, ResearchDefinition> ResearchDefinitions { get; }

    public IReadOnlyDictionary<string, EquipmentDefinition> EquipmentDefinitions { get; }

    public IReadOnlyDictionary<string, string> DefaultEquipment { get; }

    public IReadOnlyDictionary<string, BuildingDefinition> BuildingDefinitions { get; }

    public IReadOnlyDictionary<string, CatDefinition> CatDefinitions { get; }

    public IReadOnlyDictionary<string, SkillDefinition> SkillDefinitions { get; }

    public static BalanceConfig Default { get; } = new(
        new Dictionary<string, ResearchDefinition>
        {
            ["res_basic_prod"] = new("res_basic_prod", 100, "coin_production_mult", 10, null, []),
            ["res_bean_save"] = new("res_bean_save", 150, "bean_reduce", 5, "res_basic_prod", ["res_basic_prod"]),
            ["res_cheap_upgrade"] = new("res_cheap_upgrade", 200, "upgrade_cost_reduce", 5, "res_basic_prod", ["res_basic_prod"]),
            ["res_extract_2"] = new("res_extract_2", 300, "coin_production_mult", 15, "res_bean_save", ["res_bean_save"]),
            ["res_roast_2"] = new("res_roast_2", 325, "bean_reduce", 5, null, ["res_bean_save", "res_cheap_upgrade"]),
            ["res_ferment_2"] = new("res_ferment_2", 350, "upgrade_cost_reduce", 5, "res_cheap_upgrade", ["res_cheap_upgrade"]),
            ["res_espresso"] = new("res_espresso", 500, "coin_production_mult", 20, null, ["res_extract_2", "res_roast_2", "res_ferment_2"]),
        },
        new Dictionary<string, EquipmentDefinition>
        {
            ["equip_collar_green"] = new("equip_collar_green", "collar", 5, 80, [new("materialOutput", 15, 1)]),
            ["equip_collar_gold"] = new("equip_collar_gold", "collar", 8, 180, [new("mood", 8, 1)]),
            ["equip_cup_lucky"] = new("equip_cup_lucky", "cup", 5, 90, [new("catFoodCost", -5, -1)]),
            ["equip_cup_bean"] = new("equip_cup_bean", "cup", 8, 200, [new("materialOutput", 10, 2)]),
            ["equip_cushion_soft"] = new("equip_cushion_soft", "cushion", 5, 100, [new("mood", 10, 1)]),
            ["equip_cushion_sleepy"] = new("equip_cushion_sleepy", "cushion", 8, 220, [new("wageCost", -5, -1)]),
        },
        new Dictionary<string, string>
        {
            ["collar"] = "equip_collar_green",
            ["cup"] = "equip_cup_lucky",
            ["cushion"] = "equip_cushion_soft",
        },
        CreateDefaultBuildingDefinitions(),
        CreateDefaultCatDefinitions(),
        CreateDefaultSkillDefinitions());

    private static IReadOnlyDictionary<string, BuildingDefinition> CreateDefaultBuildingDefinitions()
    {
        return new Dictionary<string, BuildingDefinition>
        {
            ["building_storage_b1"] = new("building_storage_b1", "B1", 4, 50, "bean_capacity", 1000, 50, 12000),
            ["building_cafe_1f"] = new("building_cafe_1f", "1F", 6, 50, "order_coin", 180, 10, 26000),
            ["building_material_2f"] = new("building_material_2f", "2F", 7, 50, "base_production", 45, 5, 46000),
            ["building_ferment_3f"] = new("building_ferment_3f", "3F", 6, 50, "ferment_efficiency", -8, -2, 66000),
            ["building_roast_4f"] = new("building_roast_4f", "4F", 8, 50, "coffee_price", 80, 5, 98000),
            ["building_office_5f"] = new("building_office_5f", "5F", 5, 50, "salary_reduce", 10, 1, 128000),
        };
    }

    private static IReadOnlyDictionary<string, CatDefinition> CreateDefaultCatDefinitions()
    {
        return new Dictionary<string, CatDefinition>
        {
            ["c_001"] = new("c_001", "B", "producer", 10, 5, 1, 20, "s_001"),
            ["c_002"] = new("c_002", "A", "launcher", 15, 8, 2, 15, "s_002"),
            ["c_003"] = new("c_003", "A", "saver", 8, 3, 5, 18, "s_003"),
            ["c_004"] = new("c_004", "S", "producer", 30, 12, 10, 25, "s_004"),
            ["c_005"] = new("c_005", "B", "support", 12, 6, 1, 22, "s_005"),
        };
    }

    private static IReadOnlyDictionary<string, SkillDefinition> CreateDefaultSkillDefinitions()
    {
        return new Dictionary<string, SkillDefinition>
        {
            ["s_001"] = new("s_001", "production_boost", 20),
            ["s_002"] = new("s_002", "production_boost", 50),
            ["s_003"] = new("s_003", "bean_saver", 30),
            ["s_004"] = new("s_004", "team_buff", 10),
            ["s_005"] = new("s_005", "production_boost", 15),
        };
    }

    public static BalanceConfig LoadFromFile(string path)
    {
        if (!File.Exists(path))
        {
            return Default;
        }

        var json = File.ReadAllText(path);
        return FromJson(json);
    }

    public static BalanceConfig FromJson(string json)
    {
        var document = JsonSerializer.Deserialize<BalanceConfigDocument>(json, JsonOptions)
            ?? throw new InvalidOperationException("Balance config file is empty.");
        return new BalanceConfig(
            document.ResearchDefinitions ?? new Dictionary<string, ResearchDefinition>(),
            document.EquipmentDefinitions ?? new Dictionary<string, EquipmentDefinition>(),
            document.DefaultEquipment ?? new Dictionary<string, string>(),
            document.BuildingDefinitions,
            document.CatDefinitions,
            document.SkillDefinitions);
    }

    private void Validate()
    {
        foreach (var pair in ResearchDefinitions)
        {
            if (!string.Equals(pair.Key, pair.Value.ResearchId, StringComparison.Ordinal))
            {
                throw new InvalidOperationException($"Research config key '{pair.Key}' does not match id '{pair.Value.ResearchId}'.");
            }

            foreach (var parentResearchId in pair.Value.GetParentResearchIds())
            {
                if (string.Equals(pair.Key, parentResearchId, StringComparison.Ordinal))
                {
                    throw new InvalidOperationException($"Research '{pair.Key}' cannot require itself.");
                }

                if (!ResearchDefinitions.ContainsKey(parentResearchId))
                {
                    throw new InvalidOperationException($"Research '{pair.Key}' references missing parent '{parentResearchId}'.");
                }
            }
        }

        foreach (var pair in EquipmentDefinitions)
        {
            if (!string.Equals(pair.Key, pair.Value.ItemId, StringComparison.Ordinal))
            {
                throw new InvalidOperationException($"Equipment config key '{pair.Key}' does not match id '{pair.Value.ItemId}'.");
            }
        }

        foreach (var pair in DefaultEquipment)
        {
            if (!EquipmentDefinitions.TryGetValue(pair.Value, out var definition))
            {
                throw new InvalidOperationException($"Default equipment slot '{pair.Key}' references missing item '{pair.Value}'.");
            }

            if (!string.Equals(pair.Key, definition.Slot, StringComparison.Ordinal))
            {
                throw new InvalidOperationException($"Default equipment slot '{pair.Key}' references item '{pair.Value}' in slot '{definition.Slot}'.");
            }
        }

        foreach (var pair in BuildingDefinitions)
        {
            if (!string.Equals(pair.Key, pair.Value.BuildingId, StringComparison.Ordinal))
            {
                throw new InvalidOperationException($"Building config key '{pair.Key}' does not match id '{pair.Value.BuildingId}'.");
            }
        }

        foreach (var pair in SkillDefinitions)
        {
            if (!string.Equals(pair.Key, pair.Value.SkillId, StringComparison.Ordinal))
            {
                throw new InvalidOperationException($"Skill config key '{pair.Key}' does not match id '{pair.Value.SkillId}'.");
            }
        }

        foreach (var pair in CatDefinitions)
        {
            if (!string.Equals(pair.Key, pair.Value.CatId, StringComparison.Ordinal))
            {
                throw new InvalidOperationException($"Cat config key '{pair.Key}' does not match id '{pair.Value.CatId}'.");
            }

            if (!SkillDefinitions.ContainsKey(pair.Value.SkillId))
            {
                throw new InvalidOperationException($"Cat '{pair.Key}' references missing skill '{pair.Value.SkillId}'.");
            }
        }
    }
}

public sealed record BalanceConfigDocument(
    Dictionary<string, ResearchDefinition>? ResearchDefinitions,
    Dictionary<string, EquipmentDefinition>? EquipmentDefinitions,
    Dictionary<string, string>? DefaultEquipment,
    Dictionary<string, BuildingDefinition>? BuildingDefinitions,
    Dictionary<string, CatDefinition>? CatDefinitions,
    Dictionary<string, SkillDefinition>? SkillDefinitions);

public sealed record ResearchDefinition(
    string ResearchId,
    int Cost,
    string EffectType,
    int EffectValue,
    string? ParentResearchId,
    IReadOnlyList<string>? ParentResearchIds = null)
{
    public IReadOnlyList<string> GetParentResearchIds()
    {
        var parents = new List<string>();
        if (ParentResearchIds is not null)
        {
            parents.AddRange(ParentResearchIds.Where(parentId => !string.IsNullOrWhiteSpace(parentId)));
        }
        if (!string.IsNullOrWhiteSpace(ParentResearchId))
        {
            parents.Add(ParentResearchId);
        }
        return parents.Distinct(StringComparer.Ordinal).ToArray();
    }
}

public sealed record EquipmentDefinition(
    string ItemId,
    string Slot,
    int MaxLevel,
    int UpgradeCost,
    IReadOnlyList<EquipmentEffectDefinition> Effects);

public sealed record EquipmentEffectDefinition(
    string Type,
    int BaseValue,
    int PerLevel);

public sealed record BuildingDefinition(
    string BuildingId,
    string Floor,
    int Level,
    int MaxLevel,
    string EffectType,
    int BaseValue,
    int ValuePerLevel,
    int CostBase);

public sealed record CatDefinition(
    string CatId,
    string Rarity,
    string Role,
    int BaseProduction,
    int BaseBeanCost,
    int BaseSalary,
    int BaseWeight,
    string SkillId);

public sealed record SkillDefinition(
    string SkillId,
    string Type,
    int Value);
