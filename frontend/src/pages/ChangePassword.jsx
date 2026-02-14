import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

import { useAuthContext } from "../hooks/useAuthContext";
import { apiRequest } from "../utils/api";

export default function ChangePassword() {
    const { user, refreshAccessToken } = useAuthContext();
    const accessToken = user?.token;
    const navigate = useNavigate();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [loading, setLoading] = useState(false);

    const [fieldErrors, setFieldErrors] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [submitError, setSubmitError] = useState("");

    const pwRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    const validate = () => {
        const next = {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        };

        const cur = currentPassword.trim();
        const nextPw = newPassword.trim();
        const confirm = confirmPassword.trim();

        if (!cur) next.currentPassword = "Current password is required.";
        if (!nextPw) next.newPassword = "New password is required.";
        if (!confirm) next.confirmPassword = "Please confirm your new password.";

        if (cur && nextPw && nextPw === cur) {
            next.newPassword = "New password must be different from current password.";
        }

        if (nextPw && !pwRegex.test(nextPw)) {
            next.newPassword =
                "Must be 8+ chars and include uppercase, lowercase, number, and special character.";
        }

        if (nextPw && confirm && nextPw !== confirm) {
            next.confirmPassword = "New passwords do not match.";
        }

        setFieldErrors(next);

        return !Object.values(next).some(Boolean);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        setSubmitError("");

        const isValid = validate();
        if (!isValid) return;

        setLoading(true);

        const res = await apiRequest(
            "/api/user/password",
            {
                method: "PATCH",
                body: {
                    currentPassword,
                    newPassword,
                },
            },
            { accessToken, refreshAccessToken }
        );

        setLoading(false);

        if (!res.ok) {
            setSubmitError(res.error?.message || "Failed to update password");
            return;
        }

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        setFieldErrors({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setSubmitError("");

        toast.success("Password changed successfully!");
        navigate("/account", { replace: true });
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-base-100 shadow rounded-lg">
            <h1 className="text-2xl font-bold mb-6 text-center">Change Password</h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                {/* Current */}
                <div>
                    <label className="block text-sm font-semibold text-gray-600">
                        Current Password
                    </label>

                    <div className="relative">
                        <input
                            type={showCurrent ? "text" : "password"}
                            autoComplete="current-password"
                            className={`input input-bordered w-full pr-10 ${fieldErrors.currentPassword ? "input-error" : ""
                                }`}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            onBlur={validate}
                        />

                        <button
                            type="button"
                            onClick={() => setShowCurrent((prev) => !prev)}
                            className="absolute inset-y-0 right-3 flex items-center text-base-content/60 hover:text-base-content"
                            aria-label={showCurrent ? "Hide password" : "Show password"}
                        >
                            {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {fieldErrors.currentPassword && (
                        <p className="text-red-500 text-sm mt-1">{fieldErrors.currentPassword}</p>
                    )}
                </div>

                {/* New */}
                <div>
                    <label className="block text-sm font-semibold text-gray-600">
                        New Password
                    </label>

                    <div className="relative">
                        <input
                            type={showNew ? "text" : "password"}
                            autoComplete="new-password"
                            className={`input input-bordered w-full pr-10 ${fieldErrors.newPassword ? "input-error" : ""
                                }`}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            onBlur={validate}
                        />

                        <button
                            type="button"
                            onClick={() => setShowNew((prev) => !prev)}
                            className="absolute inset-y-0 right-3 flex items-center text-base-content/60 hover:text-base-content"
                            aria-label={showNew ? "Hide password" : "Show password"}
                        >
                            {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {fieldErrors.newPassword && (
                        <p className="text-red-500 text-sm mt-1">{fieldErrors.newPassword}</p>
                    )}
                </div>

                {/* Confirm */}
                <div>
                    <label className="block text-sm font-semibold text-gray-600">
                        Confirm New Password
                    </label>

                    <div className="relative">
                        <input
                            type={showConfirm ? "text" : "password"}
                            autoComplete="new-password"
                            className={`input input-bordered w-full pr-10 ${fieldErrors.confirmPassword ? "input-error" : ""
                                }`}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            onBlur={validate}
                        />

                        <button
                            type="button"
                            onClick={() => setShowConfirm((prev) => !prev)}
                            className="absolute inset-y-0 right-3 flex items-center text-base-content/60 hover:text-base-content"
                            aria-label={showConfirm ? "Hide password" : "Show password"}
                        >
                            {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {fieldErrors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">{fieldErrors.confirmPassword}</p>
                    )}
                </div>

                {/* API-level error */}
                {submitError && (
                    <p className="text-red-500 text-sm text-center">{submitError}</p>
                )}

                <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                    {loading ? "Updating..." : "Update Password"}
                </button>

                <button
                    type="button"
                    className="btn btn-link w-full"
                    onClick={() => navigate("/account")}
                >
                    Cancel
                </button>
            </form>
        </div>
    );
}
