import { useReducer, useEffect, useState, useCallback } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { authReducer } from '../reducers/authReducer';
import api from '../utils/axios';

export const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, { user: null });
    const [loading, setLoading] = useState(true);

    // in case of corrupted local storage
    const safeParseUser = () => {
        try {
            const raw = localStorage.getItem("user");
            return raw ? JSON.parse(raw) : null;
        } catch {
            localStorage.removeItem("user");
            return null;
        }
    };

    // Fetch a new ACCESS token using the httpOnly refresh cookie.
    const refreshAccessToken = useCallback(async () => {
        try {
            const { data } = await api.post("/api/user/refresh");
            const newToken = data?.token || null;

            if (!newToken) return null;

            // Update localStorage + state if a user exists
            const storedUser = safeParseUser();
            if (!storedUser) return newToken;

            const baseUser = state.user || storedUser;
            if (!baseUser) return newToken;

            const updatedUser = { ...storedUser, token: newToken };

            localStorage.setItem("user", JSON.stringify(updatedUser));
            dispatch({ type: "LOGIN", payload: updatedUser });

            return newToken;
        } catch (err) {
            if (import.meta.env.DEV) {
                console.warn("Refresh access token failed:", err);
            }
            return null;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    useEffect(() => {
        const initAuth = async () => {
            const storedUser = safeParseUser();

            if (!storedUser) {
                setLoading(false);
                return;
            }

            const newToken = await refreshAccessToken();

            if (!newToken) {
                localStorage.removeItem("user");
                dispatch({ type: "LOGOUT" });
                setLoading(false);
                return;
            }

            setLoading(false);
        };

        initAuth();
    }, [refreshAccessToken, dispatch]);


    return (
        <AuthContext.Provider
            value={{
                user: state.user,
                dispatch,
                loading,
                refreshAccessToken,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
