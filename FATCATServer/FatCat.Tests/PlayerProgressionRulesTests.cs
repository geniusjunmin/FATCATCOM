using FatCat.Domain;

namespace FatCat.Tests;

public sealed class PlayerProgressionRulesTests
{
    [Fact]
    public void Normalize_WhenExperienceCrossesThreshold_CarriesIntoNextLevel()
    {
        var progression = PlayerProgressionRules.Normalize(28, 3210);

        Assert.Equal(29, progression.Level);
        Assert.Equal(10, progression.Experience);
        Assert.Equal(3300, progression.ExperienceToNext);
    }

    [Fact]
    public void AddExperience_WhenRewardCrossesThreshold_LevelsExactlyOnce()
    {
        var progression = PlayerProgressionRules.AddExperience(28, 3100, 250);

        Assert.Equal(29, progression.Level);
        Assert.Equal(150, progression.Experience);
        Assert.Equal(3300, progression.ExperienceToNext);
    }

    [Fact]
    public void Normalize_WhenAtLevelCap_DiscardsOverflowAndHasNoNextThreshold()
    {
        var progression = PlayerProgressionRules.Normalize(60, 999999);

        Assert.Equal(60, progression.Level);
        Assert.Equal(0, progression.Experience);
        Assert.Equal(0, progression.ExperienceToNext);
    }

    [Theory]
    [InlineData(10, 250)]
    [InlineData(3, 75)]
    [InlineData(0.01, 1)]
    [InlineData(0, 0)]
    public void GetLaunchExperience_WhenProductiveSecondsVary_ReturnsDeterministicReward(
        double productiveSeconds,
        int expected)
    {
        Assert.Equal(expected, PlayerProgressionRules.GetLaunchExperience(productiveSeconds));
    }

    [Fact]
    public void GetLevelUpReward_WhenMultipleLevelsCrossed_ScalesEveryCurrencyExactlyOnce()
    {
        var reward = PlayerProgressionRules.GetLevelUpReward(28, 30);

        Assert.True(reward.HasReward);
        Assert.Equal(2, reward.LevelsGained);
        Assert.Equal(10_000, reward.Coin);
        Assert.Equal(10, reward.Diamond);
        Assert.Equal(40, reward.ResearchPoint);
    }

    [Fact]
    public void GetLevelUpReward_WhenLevelDidNotChange_ReturnsEmptyReward()
    {
        var reward = PlayerProgressionRules.GetLevelUpReward(28, 28);

        Assert.False(reward.HasReward);
        Assert.Equal(0, reward.Coin);
        Assert.Equal(0, reward.Diamond);
        Assert.Equal(0, reward.ResearchPoint);
    }
}
