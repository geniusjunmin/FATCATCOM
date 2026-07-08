using FatCat.Application;

public sealed class PlayerAuthenticationMiddleware(
    RequestDelegate next,
    PlayerTokenService tokenService,
    IHostEnvironment environment,
    IConfiguration configuration)
{
    public const string AuthenticatedPlayerIdItemKey = "FatCat.AuthenticatedPlayerId";

    public async Task InvokeAsync(HttpContext context)
    {
        if (!RequiresPlayerAuthentication(context.Request))
        {
            await next(context);
            return;
        }

        var requestedPlayerIdText = context.Request.Query["playerId"].ToString();
        if (!Guid.TryParse(requestedPlayerIdText, out var requestedPlayerId))
        {
            await WriteFailureAsync(context, StatusCodes.Status400BadRequest, "player_id_required");
            return;
        }

        var token = ReadToken(context.Request);
        var allowMissingInTests = environment.IsEnvironment("Testing")
            && configuration.GetValue("Authentication:AllowMissingInTesting", true);
        if (string.IsNullOrWhiteSpace(token))
        {
            if (allowMissingInTests)
            {
                await next(context);
                return;
            }
            await WriteFailureAsync(context, StatusCodes.Status401Unauthorized, "player_token_required");
            return;
        }

        if (!tokenService.TryValidate(token, out var authenticatedPlayerId, out var error))
        {
            await WriteFailureAsync(context, StatusCodes.Status401Unauthorized, error);
            return;
        }
        if (authenticatedPlayerId != requestedPlayerId)
        {
            await WriteFailureAsync(context, StatusCodes.Status403Forbidden, "player_token_mismatch");
            return;
        }

        context.Items[AuthenticatedPlayerIdItemKey] = authenticatedPlayerId;
        await next(context);
    }

    private static bool RequiresPlayerAuthentication(HttpRequest request)
    {
        if (HttpMethods.IsOptions(request.Method) || !request.Path.StartsWithSegments("/api"))
        {
            return false;
        }
        if (request.Path == "/api/auth/guest"
            || request.Path == "/api/server/status"
            || request.Path == "/api/config/version"
            || request.Path == "/api/config/bootstrap")
        {
            return false;
        }
        return request.Path != "/api/production/preview"
            || request.Query.ContainsKey("playerId");
    }

    private static string ReadToken(HttpRequest request)
    {
        var authorization = request.Headers.Authorization.ToString();
        const string bearerPrefix = "Bearer ";
        if (authorization.StartsWith(bearerPrefix, StringComparison.OrdinalIgnoreCase))
        {
            return authorization[bearerPrefix.Length..].Trim();
        }
        return request.Path == "/api/social/events"
            ? request.Query["access_token"].ToString()
            : "";
    }

    private static async Task WriteFailureAsync(HttpContext context, int statusCode, string error)
    {
        context.Response.StatusCode = statusCode;
        await context.Response.WriteAsJsonAsync(ApiEnvelope<object>.Fail(error));
    }
}
