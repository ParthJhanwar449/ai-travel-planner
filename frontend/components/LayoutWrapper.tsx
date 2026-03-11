"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const hideNavbar =
        pathname === "/" ||
        pathname === "/login" ||
        pathname === "/register" ||
        pathname === "/onboarding" ||
        pathname === "/forgot-password" ||
        pathname === "/reset-password" ||
        pathname.startsWith("/admin");

    return (
        <>
            <Navbar />
            <main className={`${!hideNavbar ? "pt-16" : ""} min-h-screen`}>
                {children}
            </main>
        </>
    );
}
