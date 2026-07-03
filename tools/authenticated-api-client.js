function normalizePlayerId(playerId) {
    return String(playerId || "").replace(/-/g, "").toLowerCase();
}

function createAuthenticatedApiClient(apiUrl) {
    const tokensByPlayerId = new Map();

    function registerAuth(data) {
        const playerId = data?.playerId;
        const accessToken = data?.token || data?.accessToken;
        if (playerId && accessToken) {
            tokensByPlayerId.set(normalizePlayerId(playerId), accessToken);
        }
    }

    function tokenFor(playerId) {
        return tokensByPlayerId.get(normalizePlayerId(playerId)) || "";
    }

    async function request(path, options = {}) {
        const url = new URL(path, apiUrl);
        const headers = { ...(options.headers || {}) };
        const token = tokenFor(url.searchParams.get("playerId"));
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        if (options.body !== undefined && options.body !== null && !headers["Content-Type"]) {
            headers["Content-Type"] = "application/json";
        }

        const response = await fetch(url, {
            ...options,
            headers: Object.keys(headers).length > 0 ? headers : undefined,
            body: options.body === undefined || options.body === null
                ? undefined
                : typeof options.body === "string"
                    ? options.body
                    : JSON.stringify(options.body),
        });
        const json = await response.json();
        if (url.pathname === "/api/auth/guest" && response.ok) {
            registerAuth(json.data);
        }
        return { response, json };
    }

    return {
        get: (path) => request(path),
        post: (path, body) => request(path, { method: "POST", body }),
        registerAuth,
        request,
        tokenFor,
    };
}

module.exports = { createAuthenticatedApiClient };
