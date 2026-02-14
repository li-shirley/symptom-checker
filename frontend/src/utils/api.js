import api from "./axios.js";

// Map HTTP status to backend error codes for downstream (for unexpected errors not already handled with errorHandler in backend).
const deriveCodeFromStatus = (status) => {
    switch (status) {
        case 400:
            return "BAD_REQUEST";
        case 401:
            return "UNAUTHORIZED";
        case 403:
            return "FORBIDDEN";
        case 404:
            return "NOT_FOUND";
        case 409:
            return "CONFLICT";
        case 422:
            return "UNPROCESSABLE_ENTITY";
        case 429:
            return "RATE_LIMITED";
        case 0:
            return "NETWORK_ERROR";
        default:
            return status >= 500 ? "SERVER_ERROR" : "UNKNOWN_ERROR";
    }
};


// Endpoints that do no need an attempt refresh/retry.
const isAuthEndpoint = (url = "") => {
    return (
        url.startsWith("/api/user/login") ||
        url.startsWith("/api/user/signup") ||
        url.startsWith("/api/user/refresh") ||
        url.startsWith("/api/user/logout")
    );
};

// pseudo HIPAA considerations: endpoints that could contain sensitive info
const isSensitiveEndpoint = (url = "") => {
    return (
        url.startsWith("/api/infermedica") ||
        url.startsWith("/api/triage") ||
        url.startsWith("/api/medlineplus")
    );
};

const redactBodyForLog = (url, body) => {
    if (!body || typeof body !== "object") return body;
    if (!isSensitiveEndpoint(url)) return body;

    // Redact potentially sensitive content but still provide useful structure.
    const keys = Object.keys(body);
    return { redacted: true, keys };
};

const getHeaderRequestId = (headers) => {
    if (!headers) return undefined;
    return headers["x-request-id"];
};

const normalizeAxiosError = (err) => {
    const status = err?.response?.status ?? 0; // 0 = non-HTTP failure

    const headerRequestId = getHeaderRequestId(err?.response?.headers);
    const bodyError = err?.response?.data?.error;

    const requestId = bodyError?.requestId || headerRequestId;

    // Prefer backend error details when present
    if (bodyError && typeof bodyError === "object") {
        return {
            status,
            error: {
                message: bodyError.message || (status ? "Request failed" : "Network error"),
                code: bodyError.code || deriveCodeFromStatus(status),
                requestId,
            },
            raw: err?.response?.data,
        };
    }

    // Fallback: network errors/timeouts/etc
    const message =
        err?.message ||
        (status ? "Request failed" : "Network error");

    return {
        status,
        error: {
            message,
            code: deriveCodeFromStatus(status),
            requestId,
        },
        raw: err?.response?.data,
    };
};

// Prevent duplicate refresh calls:
let refreshPromise = null;
const refreshWithLock = async (refreshAccessToken) => {
    if (!refreshAccessToken) return null;

    if (!refreshPromise) {
        refreshPromise = (async () => {
            try {
                return await refreshAccessToken();
            } finally {
                refreshPromise = null;
            }
        })();
    }

    return await refreshPromise;
};

// API call wrapper
export const apiRequest = async (
    url,
    { method = "GET", body = null, headers: customHeaders = {} } = {},
    { accessToken, refreshAccessToken } = {},
    retry = true
) => {
    const isDev = import.meta.env.DEV;

    const headers = {
        ...customHeaders,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };

    // only log this much detial in dev
    if (isDev) {
        console.groupCollapsed(`API ${method} ${url}`);
        console.log("Headers:", { ...headers, Authorization: accessToken ? "Bearer ***" : undefined });
        console.log("Body:", redactBodyForLog(url, body));
        console.groupEnd();
    }

    try {
        const res = await api({
            url,
            method,
            data: body,
            headers,
        });

        const requestId = getHeaderRequestId(res?.headers);

        if (isDev) {
            console.groupCollapsed(`API OK ${method} ${url}`);
            console.log("Status:", res.status);
            console.log("RequestId:", requestId);
            console.log("Data:", res.data);
            console.groupEnd();
        }

        return {
            ok: true,
            status: res.status,
            data: res.data,
            error: null,
            requestId,
        };
    } catch (err) {
        const normalized = normalizeAxiosError(err);

        if (isDev) {
            console.groupCollapsed(`API FAIL ${method} ${url}`);
            console.log("Status:", normalized.status);
            console.log("Error:", normalized.error);
            console.log("Raw:", normalized.raw);
            console.groupEnd();
        }

        // 401 refresh + retry
        if (
            normalized.status === 401 &&
            retry &&
            !isAuthEndpoint(url) &&
            typeof refreshAccessToken === "function"
        ) {
            const newAccessToken = await refreshWithLock(refreshAccessToken);

            if (newAccessToken) {
                return apiRequest(
                    url,
                    { method, body, headers: customHeaders },
                    { accessToken: newAccessToken, refreshAccessToken },
                    false
                );
            }
        }

        return {
            ok: false,
            status: normalized.status || 500,
            data: null,
            error: normalized.error,
            requestId: normalized.error?.requestId,
        };
    }
};
