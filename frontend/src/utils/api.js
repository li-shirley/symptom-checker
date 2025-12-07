// utils/api.js
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
    try {
        const headers = {
            ...customHeaders,
            ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
        };

        const res = await api({ url, method, data: body, headers });
        return { success: true, status: res.status, data: res.data };
    } catch (err) {
        // Handle 401: attempt token refresh once
        if (err.response?.status === 401 && retry && refreshToken) {
            const newToken = await refreshToken();
            if (newToken) {
                // retry request with updated token
                return apiRequest(url, { method, body, headers: customHeaders }, { user: { ...user, token: newToken }, refreshToken }, false);
            }
        }

        // Fallback: return structured error
        return {
            success: false,
            status: err.response?.status || 500,
            data: err.response?.data || { error: err.message || "Request failed" },
        };
    }
};
