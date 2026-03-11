"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";

interface Trip {
    id: number;
    city: string;
    trip_days: number;
    total_cost: number;
}

interface UserProfile {
    id: number;
    name: string;
    email: string;
    trips: Trip[];
}

export default function AdminUserProfile() {
    const { id } = useParams();

    const [user, setUser] = useState<UserProfile | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const res = await api.get(`/admin/users/${id}`);
            setUser(res.data);
        };

        fetchUser();
    }, [id]);

    if (!user) return <p className="text-white p-10">Loading...</p>;

    return (
        <div className="min-h-screen bg-[#040905] text-white p-10">
            <h1 className="text-3xl font-bold mb-4">{user.name}</h1>
            <p className="text-gray-400 mb-10">{user.email}</p>

            <h2 className="text-2xl font-bold mb-6">Trip History</h2>

            <div className="space-y-4">
                {user.trips.map((trip) => (
                    <Link
                        key={trip.id}
                        href={`/trips/${trip.id}`}
                        className="block bg-white/5 p-4 rounded-lg hover:bg-white/10"
                    >
                        <p className="font-semibold">{trip.city}</p>
                        <p className="text-sm text-gray-400">
                            {trip.trip_days} days • €{trip.total_cost}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
}