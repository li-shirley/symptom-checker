// components/Navbar.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuth.js";
import { useLogout } from "../hooks/useLogout.js";
import { Menu, X } from "lucide-react"; // lucide icons

const MenuLinks = ({ isMobile, logout, user }) => (
    <>
        {user ? (
            <>
                <Link to="/history" className={`btn btn-ghost ${isMobile ? "w-full" : ""}`}>
                    My Symptom History
                </Link>
                <button
                    onClick={logout}
                    className={`btn btn-error ${isMobile ? "w-full" : ""}`}
                >
                    Logout
                </button>
            </>
        ) : (
            <>
                <Link to="/login" className={`btn btn-primary ${isMobile ? "w-full" : ""}`}>
                    Login
                </Link>
                <Link to="/signup" className={`btn btn-ghost ${isMobile ? "w-full" : ""}`}>
                    Sign Up
                </Link>
            </>
        )}
    </>
);

const Navbar = () => {
    const { user } = useAuthContext();
    const { logout } = useLogout();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="navbar bg-base-100 shadow-md px-4 relative">
            {/* Left side: brand/home */}
            <div className="flex-1">
                <Link to="/" className="btn btn-ghost normal-case text-xl">
                    Home
                </Link>
            </div>

            {/* Center: user info */}
            <div className="hidden md:flex flex-1 justify-center">
                {user && <span className="font-medium">Hi, {user.email}</span>}
            </div>

            {/* Right side: links & buttons */}
            <div className="flex-none">
                {/* Desktop links */}
                <div className="hidden md:flex gap-2">
                    <MenuLinks isMobile={false} logout={logout} user={user} />
                </div>

                {/* Mobile menu button */}
                <div className="md:hidden">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="btn btn-square btn-ghost"
                        aria-label="Toggle menu"
                        aria-expanded={isOpen}
                    >
                        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile dropdown */}
            {isOpen && (
                <div className="absolute top-16 right-4 bg-base-100 shadow-md rounded-lg p-2 flex flex-col gap-2 md:hidden">
                    <MenuLinks isMobile={true} logout={logout} user={user} />
                </div>
            )}
        </div>
    );
};

export default Navbar;
