"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface AdminStats {
    total_users: number;
    total_trips: number;
    avg_trip_cost: number;
    most_popular_city: string;
}

export default function AdminDashboardPage() {

    const [stats, setStats] = useState<AdminStats | null>(null);

    useEffect(() => {

        const fetchStats = async () => {
            try {
                const res = await api.get("/admin/stats");
                setStats(res.data);
            } catch (err) {
                console.error("Failed to load admin stats", err);
            }
        };

        fetchStats();

    }, []);

    return (
        <div className="text-white">

            <h1 className="text-3xl font-black mb-10 uppercase tracking-widest">
                Admin Dashboard
            </h1>

            {/* Analytics Cards */}
            {stats && (
                <div className="grid md:grid-cols-4 gap-6 mb-12">

                    <div className="bg-white/5 border border-white/10 p-6 rounded-xl text-center">
                        <p className="text-gray-400 text-sm mb-1">Total Users</p>
                        <h2 className="text-3xl font-bold">{stats.total_users}</h2>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-6 rounded-xl text-center">
                        <p className="text-gray-400 text-sm mb-1">Trips Generated</p>
                        <h2 className="text-3xl font-bold">{stats.total_trips}</h2>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-6 rounded-xl text-center">
                        <p className="text-gray-400 text-sm mb-1">Average Trip Cost</p>
                        <h2 className="text-3xl font-bold">€{stats.avg_trip_cost}</h2>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-6 rounded-xl text-center">
                        <p className="text-gray-400 text-sm mb-1">Most Popular City</p>
                        <h2 className="text-3xl font-bold">{stats.most_popular_city}</h2>
                    </div>

                </div>
            )}

            {/* Admin Tools */}
            <div className="grid md:grid-cols-4 gap-6">

                <Link
                    href="/admin/cities"
                    className="bg-emerald-600 hover:bg-emerald-500 p-6 rounded-xl font-bold text-center transition"
                >
                    Manage Cities
                </Link>

                <Link
                    href="/admin/attractions"
                    className="bg-amber-600 hover:bg-amber-500 p-6 rounded-xl font-bold text-center transition"
                >
                    Manage Attractions
                </Link>

                <Link
                    href="/admin/hotels"
                    className="bg-blue-600 hover:bg-blue-500 p-6 rounded-xl font-bold text-center transition"
                >
                    Manage Hotels
                </Link>

                <Link
                    href="/admin/users"
                    className="bg-purple-600 hover:bg-purple-500 p-6 rounded-xl font-bold text-center transition"
                >
                    Manage Users
                </Link>

            </div>

        </div>
    );
}
