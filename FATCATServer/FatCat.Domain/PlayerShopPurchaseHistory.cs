namespace FatCat.Domain;

public sealed class PlayerShopPurchaseHistory
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PlayerId { get; set; }
    public string ShopItemId { get; set; } = "";
    public int PurchaseDate { get; set; }
    public int Count { get; set; }
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public PlayerProfile? Player { get; set; }
}
