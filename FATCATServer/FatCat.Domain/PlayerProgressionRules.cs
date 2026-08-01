namespace FatCat.Domain;

public readonly record struct PlayerProgressionState(
    int Level,
    int Experience,
    int ExperienceToNext);

public readonly record struct PlayerLevelUpReward(
    int FromLevel,
    int ToLevel,
    int Coin,
    int Diamond,
    int ResearchPoint)
{
    public int LevelsGained => Math.Max(0, ToLevel - FromLevel);
    public bool HasReward => LevelsGained > 0;
}

public static class PlayerProgressionRules
{
    public const int InitialLevel = 28;
    public const int InitialExperience = 2560;
    public const int LevelCap = 60;
    public const int LaunchExperiencePerSecond = 25;
    public const int LevelRewardCoin = 5_000;
    public const int LevelRewardDiamond = 5;
    public const int LevelRewardResearchPoint = 20;

    public static int GetExperienceToNext(int level)
    {
        var normalizedLevel = Math.Clamp(level, 1, LevelCap);
        return normalizedLevel >= LevelCap ? 0 : 400 + normalizedLevel * 100;
    }

    public static int GetLaunchExperience(double productiveSeconds)
    {
        if (!double.IsFinite(productiveSeconds) || productiveSeconds <= 0)
        {
            return 0;
        }

        return Math.Max(1, (int)Math.Floor(productiveSeconds * LaunchExperiencePerSecond));
    }

    public static PlayerProgressionState Normalize(int level, int experience)
    {
        var normalizedLevel = Math.Clamp(level, 1, LevelCap);
        var normalizedExperience = Math.Max(0, experience);

        while (normalizedLevel < LevelCap)
        {
            var threshold = GetExperienceToNext(normalizedLevel);
            if (normalizedExperience < threshold)
            {
                return new PlayerProgressionState(normalizedLevel, normalizedExperience, threshold);
            }

            normalizedExperience -= threshold;
            normalizedLevel++;
        }

        return new PlayerProgressionState(LevelCap, 0, 0);
    }

    public static PlayerProgressionState AddExperience(int level, int experience, int experienceGained)
    {
        var normalized = Normalize(level, experience);
        if (normalized.Level >= LevelCap || experienceGained <= 0)
        {
            return normalized;
        }

        return Normalize(normalized.Level, normalized.Experience + experienceGained);
    }

    public static PlayerLevelUpReward GetLevelUpReward(int rewardedThroughLevel, int currentLevel)
    {
        var fromLevel = Math.Clamp(rewardedThroughLevel, 1, LevelCap);
        var toLevel = Math.Clamp(currentLevel, fromLevel, LevelCap);
        var levelsGained = toLevel - fromLevel;
        return new PlayerLevelUpReward(
            fromLevel,
            toLevel,
            levelsGained * LevelRewardCoin,
            levelsGained * LevelRewardDiamond,
            levelsGained * LevelRewardResearchPoint);
    }
}
