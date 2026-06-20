namespace FatCat.Application;

public sealed record ApiEnvelope<T>(bool Ok, T? Data = default, string? Error = null, long ServerTime = 0)
{
    public static ApiEnvelope<T> Success(T data) => new(true, data, null, DateTimeOffset.UtcNow.ToUnixTimeMilliseconds());
    public static ApiEnvelope<T> Fail(string error, T? data = default) => new(false, data, error, DateTimeOffset.UtcNow.ToUnixTimeMilliseconds());
}
