import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react"
import toast from 'react-hot-toast';
import { useAuthContext } from "../hooks/useAuthContext";
import { useAuthActions } from "../hooks/useAuthActions.js";
import Modal from "../components/Modal.jsx";

export default function UserAccount() {
    const { user } = useAuthContext();
    const navigate = useNavigate();
    const { deleteUser, deleteLoading, deleteError } = useAuthActions();

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false)

    const handleDeleteAccount = async () => {
        if (!currentPassword.trim() || deleteLoading) return;

        const success = await deleteUser(currentPassword);
        if (success) {
            closeDeleteModal();
            toast.success("Account deleted successfully!");
            navigate("/login", { replace: true });
            // redirect after deletion
        }
    };

    const closeDeleteModal = useCallback(() => {
        setDeleteModalOpen(false);
        setCurrentPassword("");
        setShowPassword(false);
    }, []);

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-base-100 shadow rounded-lg">
            <h1 className="text-2xl font-bold mb-6">Account Details</h1>

            <div className="flex flex-col gap-4">
                {/* User Info */}
                <div>
                    <label className="block text-sm font-semibold text-gray-600">Email</label>
                    <p className="mt-1 text-gray-800">{user.email}</p>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-600">Date of Birth</label>
                    <p className="mt-1 text-gray-800">
                        {new Date(user.birthDate).toLocaleDateString("en-US")}
                    </p>

                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-600">Age</label>
                    <p className="mt-1 text-gray-800">{user.age}</p>
                </div>

                {/* Change Password */}
                <div>
                    <button
                        className="btn btn-link w-full"
                        onClick={() => navigate("/change-password")}
                    >
                        Change Password
                    </button>
                </div>

                {/* Delete Account */}
                <div>
                    <button
                        className="btn btn-error w-full"
                        onClick={() => setDeleteModalOpen(true)}
                    >
                        Delete Account
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModalOpen}
                onCancel={closeDeleteModal}
                onConfirm={handleDeleteAccount}
                title="Confirm Account Deletion"
                confirmDisabled={!currentPassword || deleteLoading}
                message={
                    <div className="flex flex-col gap-2">
                        <p>
                            Enter your password to confirm account deletion. This action cannot be undone.
                        </p>

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                className={`input input-bordered w-full pr-10 ${deleteError?.message ? "input-error" : ""}`}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute inset-y-0 right-3 flex items-center text-base-content/60 hover:text-base-content"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {/* Delete Account Error */}
                        {deleteError?.message && (
                            <p className="text-red-500 mt-4 text-center">{deleteError.message}</p>
                        )}
                    </div>
                }
                confirmText={deleteLoading ? "Deleting..." : "Delete"}
                cancelText="Cancel"
            />
        </div>
    );
}
