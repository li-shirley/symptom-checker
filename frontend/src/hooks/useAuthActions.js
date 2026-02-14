import { useState } from "react";
import { useAuthContext } from "./useAuthContext";
import { apiRequest } from "../utils/api";

export const useAuthActions = () => {
    const { dispatch, user, refreshAccessToken } = useAuthContext();

    const [loginLoading, setLoginLoading] = useState(false);
    const [signupLoading, setSignupLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);

    const [loginError, setLoginError] = useState(null);
    const [signupError, setSignupError] = useState(null);
    const [deleteError, setDeleteError] = useState(null);

    const accessToken = user?.token;

    // Login
    const login = async (email, password) => {
        setLoginLoading(true);
        setLoginError(null);

        const res = await apiRequest(
            "/api/user/login",
            { method: "POST", body: { email, password } },
            { accessToken }
        );

        if (!res.ok) {
            setLoginError(res.error);
            setLoginLoading(false);
            return false;
        }

        localStorage.setItem("user", JSON.stringify(res.data));
        dispatch({ type: "LOGIN", payload: res.data });

        setLoginLoading(false);
        return true;
    };

    // Signup
    const signup = async (email, password, birthDate) => {
        setSignupLoading(true);
        setSignupError(null);

        const res = await apiRequest(
            "/api/user/signup",
            { method: "POST", body: { email, password, birthDate } },
            { accessToken }
        );

        if (!res.ok) {
            setSignupError(res.error);
            setSignupLoading(false);
            return false;
        }

        localStorage.setItem("user", JSON.stringify(res.data));
        dispatch({ type: "LOGIN", payload: res.data });

        setSignupLoading(false);
        return true;
    };

    // Logout
    const logout = async () => {
        if (!user) return false;

        setLogoutLoading(true);

        const res = await apiRequest(
            "/api/user/logout",
            { method: "POST" },
            { accessToken }
        );

        if (!res.ok && import.meta.env.DEV) {
            console.warn("Logout request failed:", res.error);
        }

        // log user out in frontend regardless of backend success/failure
        localStorage.removeItem("user");
        dispatch({ type: "LOGOUT" });

        setLogoutLoading(false);
        return true;
    };

    // Delete User
    const deleteUser = async (currentPassword) => {
        if (!user) return false;

        setDeleteLoading(true);
        setDeleteError(null);

        const res = await apiRequest(
            "/api/user",
            { method: "DELETE", body: { currentPassword } },
            { accessToken, refreshAccessToken }
        );

        if (!res.ok) {
            setDeleteError(res.error);
            setDeleteLoading(false);
            return false;
        }

        localStorage.removeItem("user");
        dispatch({ type: "LOGOUT" });

        setDeleteLoading(false);
        return true;
    };

    return {
        user,

        // Actions
        login,
        signup,
        logout,
        deleteUser,

        // Loading states
        loginLoading,
        signupLoading,
        logoutLoading,
        deleteLoading,

        // Error states
        loginError,
        signupError,
        deleteError,
    };
};
