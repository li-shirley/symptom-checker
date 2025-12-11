import api from "./axios.js";

/**
 * Generalized API request helper.
 * Handles token, optional 401 refresh, and returns structured response.
 *
 * @param {string} url - endpoint
 * @param {object} options - { method, body, headers }
 * @param {object} auth - { user, refreshToken }
 * @param {boolean} retry - internal flag to retry once after 401
 */
export const apiRequest = async (
    url,
    { method = "GET", body = null, headers: customHeaders = {} } = {},
    { user, refreshToken } = {},
    retry = true
) => {
    const requestId = Math.random().toString(36).slice(2, 8);
    const caller = new Error().stack?.split("\n")[2]?.trim();

    console.groupCollapsed(`🌐 API REQUEST [${requestId}]`);
    console.log("Caller:", caller);
    console.log("URL:", url);
    console.log("Method:", method);
    console.log("Body:", body);
    console.log("Retry:", retry);
    console.groupEnd();

    try {
        const headers = {
            ...customHeaders,
            ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
        };

        const res = await api({ url, method, data: body, headers });

        console.groupCollapsed(`✅ API RESPONSE [${requestId}]`);
        console.log("Status:", res.status);
        console.log("Data:", res.data);
        console.groupEnd();

        return { success: true, status: res.status, data: res.data };

    } catch (err) {
        console.groupCollapsed(`❌ API ERROR [${requestId}]`);
        console.log("Status:", err.response?.status);
        console.log("Response Data:", err.response?.data);
        console.log("Error Message:", err.message);
        console.log("Retry allowed:", retry);
        console.groupEnd();

        // 401 retry logic
        if (err.response?.status === 401 && retry && refreshToken) {
            console.warn(`🔁 Retrying API REQUEST [${requestId}] after token refresh`);
            const newToken = await refreshToken();
            if (newToken) {
                return apiRequest(
                    url,
                    { method, body, headers: customHeaders },
                    { user: { ...user, token: newToken }, refreshToken },
                    false
                );
            }
        }

        return {
            success: false,
            status: err.response?.status || 500,
            data: err.response?.data || { error: err.message || "Request failed" },
        };
    }
};

