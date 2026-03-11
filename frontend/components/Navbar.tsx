"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();

    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        const storedUser = localStorage.getItem("user");

        // Skip redirect for public pages and admin pages
        const isPublicPage =
            pathname === "/" ||
            pathname === "/login" ||
            pathname === "/register" ||
            pathname === "/forgot-password" ||
            pathname === "/reset-password";
        const isAdminPage = pathname.startsWith("/admin");

        if (isPublicPage || isAdminPage) return;

        // If no token → redirect to login
        if (!token) {
            router.replace("/login");
            return;
        }

        if (storedUser) {
            const user = JSON.parse(storedUser);
            setIsAdmin(user.is_admin === true);
        }

    }, [router, pathname]);

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        router.push("/login");
    };

    // Don't render Navbar on specific pages:
    // - Landing page (/)
    // - Auth pages (/login, /register)
    // - Onboarding (/onboarding)
    // - Admin Panel (/admin/*)
    const hideNavbar =
        pathname === "/" ||
        pathname === "/login" ||
        pathname === "/register" ||
        pathname === "/onboarding" ||
        pathname === "/forgot-password" ||
        pathname === "/reset-password" ||
        pathname.startsWith("/admin");

    if (hideNavbar) return null;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#040905]/80 backdrop-blur-md border-b border-emerald-900/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="flex justify-between items-center h-16">

                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-emerald-900 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/10">
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="white" />
                            </svg>
                        </div>

                        <span className="text-xl font-black text-white tracking-tighter">
                            VOYAGE<span className="text-emerald-400">PLANNER</span>
                        </span>
                    </Link>

                    {/* Navigation */}
                    <div className="flex items-center gap-4">

                        {pathname !== "/generate-trip" && (
                            <button
                                onClick={() => router.push("/generate-trip")}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Generate Trip</span>
                            </button>
                        )}

                        {pathname !== "/dashboard" && (
                            <Link
                                href="/dashboard"
                                className="px-4 py-2 bg-white/5 border border-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-all"
                            >
                                Dashboard
                            </Link>
                        )}

                        {pathname !== "/profile" && (
                            <Link
                                href="/profile"
                                className="px-4 py-2 text-white/70 hover:text-emerald-400 rounded-xl text-sm font-bold transition-all"
                            >
                                My Profile
                            </Link>
                        )}

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            title="Logout"
                            className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-red-600 hover:border-red-600 transition-all duration-300 ml-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                            </svg>
                        </button>

                    </div>
                </div>
            </div>
        </nav>
    );
}
