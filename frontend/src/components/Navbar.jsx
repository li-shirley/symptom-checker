import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { useAuthActions } from "../hooks/useAuthActions";
import { Menu, X, User, HeartPulse } from "lucide-react";
import Modal from "./Modal";

const Navbar = () => {
    const { user } = useAuthContext();
    const { logout } = useAuthActions();
    const navigate = useNavigate();
    const location = useLocation();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [avatarOpen, setAvatarOpen] = useState(false);
    const avatarMenuRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [nextPath, setNextPath] = useState(null);

    const isOnSymptomCheck = location.pathname.startsWith("/check-symptoms");

    const closeMenus = () => {
        setMobileOpen(false);
        setAvatarOpen(false);
    };

    const handleNavigate = (path) => {
        closeMenus();

        if (isOnSymptomCheck) {
            setNextPath(path);
            setModalOpen(true);
            return;
        }

        navigate(path);
    };

    const confirmLeave = () => {
        setModalOpen(false);
        if (nextPath) navigate(nextPath);
    };

    const handleLogout = async () => {
        closeMenus();
        await logout();
        navigate("/login", { replace: true });
    };

    const actions = user
        ? [
            {
                key: "history",
                label: "My Symptom History",
                className: "btn btn-accent w-full",
                onClick: () => handleNavigate("/history"),
            },
            {
                key: "account",
                label: "Account",
                className: "btn btn-ghost w-full",
                onClick: () => handleNavigate("/account"),
            },
            {
                key: "logout",
                label: "Logout",
                className: "btn btn-error w-full",
                onClick: handleLogout,
            },
        ]
        : [
            {
                key: "login",
                label: "Login",
                className: "btn btn-primary w-full md:w-auto",
                onClick: () => handleNavigate("/login"),
            },
            {
                key: "signup",
                label: "Sign Up",
                className: "btn btn-ghost w-full md:w-auto",
                onClick: () => handleNavigate("/signup"),
            },
        ];

    const renderActions = (
        containerClassName = "flex flex-col gap-2",
        itemClassName = ""
    ) => (
        <div className={containerClassName}>
            {actions.map((a) => (
                <button
                    key={a.key}
                    className={`${a.className} ${itemClassName}`.trim()}
                    onClick={a.onClick}
                >
                    {a.label}
                </button>
            ))}
        </div>
    );

    // Outside click + Esc close for both menus
    useEffect(() => {
        if (!avatarOpen && !mobileOpen) return;

        const onPointerDown = (e) => {
            const target = e.target;

            if (avatarOpen && avatarMenuRef.current && !avatarMenuRef.current.contains(target)) {
                setAvatarOpen(false);
            }

            if (mobileOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(target)) {
                setMobileOpen(false);
            }
        };

        const onKeyDown = (e) => {
            if (e.key === "Escape") {
                closeMenus();
            }
        };

        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [avatarOpen, mobileOpen]);

    return (
        <>
            <div className="navbar bg-base-100 shadow-md px-4 relative">
                {/* Home / Branding */}
                <div className="flex-1">
                    <button
                        className="group btn btn-ghost normal-case px-2 md:px-3"
                        onClick={() => handleNavigate("/")}
                        aria-label="Symptom Checker"
                    >
                        <span className=" inline-flex items-center justify-center rounded-xl bg-primary/15 text-primary w-9 h-9 transition-transform duration-200 group-hover:scale-105">
                            <HeartPulse className="text-lg" />
                        </span>

                        <span className="flex flex-col items-start leading-tight">
                            <span className="text-lg md:text-xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                Symptom Checker
                            </span>

                            <span className="hidden sm:inline-flex items-center gap-2 text-xs opacity-70">
                                Check symptoms in minutes
                            </span>
                        </span>
                    </button>
                </div>

                {/* Hi, User (desktop only) */}
                <div className="hidden md:flex flex-1 justify-center min-w-0">
                    {user && (
                        <span className="font-medium truncate max-w-[28ch]">
                            Hi, {user.email}
                        </span>
                    )}
                </div>

                {/* Desktop */}
                <div className="hidden md:flex gap-2 items-center">
                    {user ? (
                        <div ref={avatarMenuRef} className="relative">
                            <button
                                className="btn btn-circle btn-ghost avatar placeholder"
                                onClick={() => setAvatarOpen((v) => !v)}
                                aria-label="Account menu"
                                aria-expanded={avatarOpen}
                            >
                                <div className="bg-primary text-primary-content rounded-full w-8">
                                    {avatarOpen ? <X className="h-5 w-5" /> : <User className="h-5 w-5" />}
                                </div>
                            </button>

                            {avatarOpen && (
                                <div className="absolute right-0 mt-2 bg-base-100 shadow rounded-lg p-2 min-w-max">
                                    {renderActions()}
                                </div>
                            )}
                        </div>
                    ) : (
                        // Logged-out desktop
                        renderActions("flex gap-2 items-center")
                    )}
                </div>

                {/* Mobile toggle + drawer wrapper */}
                <div ref={mobileMenuRef} className="md:hidden">
                    <button
                        onClick={() => setMobileOpen((v) => !v)}
                        className="btn btn-square btn-ghost"
                        aria-label="Open menu"
                        aria-expanded={mobileOpen}
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>

                    {/* Mobile Drawer */}
                    {mobileOpen && (
                        <div className="absolute top-16 right-4 bg-base-100 shadow-md rounded-lg p-2 min-w-[220px]">
                            {user && (
                                <div className="px-3 py-2 text-sm opacity-70 border-b border-base-200 mb-2 text-center">
                                    Hi, <span className="font-medium">{user.email}</span>
                                </div>
                            )}
                            {renderActions()}
                        </div>
                    )}

                </div>
            </div>

            <Modal
                isOpen={modalOpen}
                onCancel={() => setModalOpen(false)}
                onConfirm={confirmLeave}
                title="Leave Symptom Checker?"
                message="All progress will be lost if you leave the symptom checker."
                confirmText="Leave"
                cancelText="Stay"
            />
        </>
    );
};

export default Navbar;
