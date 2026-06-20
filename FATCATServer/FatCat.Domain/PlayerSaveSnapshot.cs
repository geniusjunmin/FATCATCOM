namespace FatCat.Domain;

public sealed class PlayerSaveSnapshot
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PlayerId { get; set; }
    public int ClientVersion { get; set; }
    public long LocalUpdatedAt { get; set; }
    public string SaveJson { get; set; } = "{}";
    public DateTimeOffset SyncedAt { get; set; } = DateTimeOffset.UtcNow;
    public PlayerProfile? Player { get; set; }
}
