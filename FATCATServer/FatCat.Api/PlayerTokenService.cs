using System.Security.Cryptography;
using System.Text;

public sealed class PlayerTokenService
{
    private readonly byte[] signingKey;
    private readonly TimeSpan lifetime;

    public PlayerTokenService(IConfiguration configuration, IHostEnvironment environment)
    {
        var configuredKey = configuration["Authentication:SigningKey"];
        if (string.IsNullOrWhiteSpace(configuredKey))
        {
            if (environment.IsProduction())
            {
                throw new InvalidOperationException("Authentication:SigningKey is required in production.");
            }
            configuredKey = "fatcat-local-development-signing-key-change-before-production";
        }
        signingKey = Encoding.UTF8.GetBytes(configuredKey);
        lifetime = TimeSpan.FromDays(Math.Clamp(
            configuration.GetValue("Authentication:TokenLifetimeDays", 30),
            1,
            365));
    }

    public string Issue(Guid playerId, DateTimeOffset? issuedAt = null)
    {
        var timestamp = (issuedAt ?? DateTimeOffset.UtcNow).ToUnixTimeSeconds();
        var payload = $"v1.{playerId:N}.{timestamp}";
        return $"{payload}.{Sign(payload)}";
    }

    public bool TryValidate(string token, out Guid playerId, out string error)
    {
        playerId = Guid.Empty;
        error = "invalid_player_token";
        var parts = token.Split('.');
        if (parts.Length != 4
            || parts[0] != "v1"
            || !Guid.TryParseExact(parts[1], "N", out playerId)
            || !long.TryParse(parts[2], out var issuedUnix))
        {
            return false;
        }

        var payload = string.Join('.', parts.Take(3));
        var expected = Encoding.ASCII.GetBytes(Sign(payload));
        var actual = Encoding.ASCII.GetBytes(parts[3]);
        if (expected.Length != actual.Length
            || !CryptographicOperations.FixedTimeEquals(expected, actual))
        {
            playerId = Guid.Empty;
            return false;
        }

        var issuedAt = DateTimeOffset.FromUnixTimeSeconds(issuedUnix);
        var now = DateTimeOffset.UtcNow;
        if (issuedAt > now.AddMinutes(5) || now - issuedAt > lifetime)
        {
            playerId = Guid.Empty;
            error = "player_token_expired";
            return false;
        }

        error = "";
        return true;
    }

    private string Sign(string payload)
    {
        using var hmac = new HMACSHA256(signingKey);
        return Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(payload)))
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
    }
}
