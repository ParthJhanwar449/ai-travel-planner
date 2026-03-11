"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {

    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {

        if (pathname === "/admin") return;

        const token = localStorage.getItem("access_token");
        const storedUser = localStorage.getItem("user");

        if (!token) {
            router.replace("/admin");
            return;
        }

        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                if (!user.is_admin) {
                    router.replace("/admin");
                    return;
                }
            } catch (e) {
                router.replace("/admin");
                return;
            }
        } else {
            router.replace("/admin");
            return;
        }

    }, [pathname, router]);

    if (pathname === "/admin") {
        return children;
    }

    const logout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        router.push("/admin");
    };

    return (
        <div className="flex min-h-screen bg-[#040905] text-white">

            <aside className="w-64 bg-black/40 border-r border-white/10 p-6 space-y-6">

                <h2 className="text-xl font-bold">Admin Panel</h2>

                <nav className="flex flex-col gap-3">

                    <Link href="/admin/dashboard">Dashboard</Link>
                    <Link href="/admin/cities">Cities</Link>
                    <Link href="/admin/attractions">Attractions</Link>
                    <Link href="/admin/hotels">Hotels</Link>
                    <Link href="/admin/users">Users</Link>

                </nav>

                <button
                    onClick={logout}
                    className="mt-10 bg-red-600 px-4 py-2 rounded"
                >
                    Logout
                </button>

            </aside>

            <main className="flex-1 p-10">
                {children}
            </main>

        </div>
    );
}
