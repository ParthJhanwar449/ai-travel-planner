"use client";

import { useEffect, useState } from "react";
import { useRouter as useNextRouter } from "next/navigation";
import { userService } from "@/services/user.service";
import { api } from "@/lib/api";
import Link from "next/link";

interface Trip {
    id: number;
    city: string;
    trip_days: number;
    total_cost: number;
    season: string;
    created_at: string;
}

const cities = [
    {
        name: "Paris",
        description: "The city of lights, known for art, history, and romantic charm.",
        image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop"
    },
    {
        name: "Lyon",
        description: "France’s culinary capital, rich in Renaissance architecture and culture.",
        image: "https://images.unsplash.com/photo-1503917988258-f87a78e3c995?q=80&w=2074&auto=format&fit=crop"
    }
];

export default function DashboardPage() {
    const router = useNextRouter();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [greeting, setGreeting] = useState("Welcome Back");

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good Morning");
        else if (hour < 17) setGreeting("Good Afternoon");
        else setGreeting("Good Evening");

        const fetchData = async () => {
            try {
                // Check preferences
                const user = await userService.getMe();

                const noInterests =
                    (user.interest_culture == null || user.interest_culture === 0) &&
                    (user.interest_nature == null || user.interest_nature === 0) &&
                    (user.interest_food == null || user.interest_food === 0) &&
                    (user.interest_entertainment == null || user.interest_entertainment === 0);

                if (noInterests) {
                    router.push("/onboarding");
                    return;
                }

                // Fetch trips
                const response = await api.get("/trips");
                setTrips(response.data);
            } catch (error) {
                console.error("Dashboard fetch failed", error);
                router.push("/login");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [router]);

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-64px)] bg-[#040905] flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-900/5 blur-[120px] rounded-full" />
                <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(16,185,129,0.2)]"></div>
                    <p className="text-white/60 animate-pulse font-bold tracking-widest uppercase text-xs">Organizing Your Trips...</p>
                </div>
            </div>
        );
    }

    const totalCost = trips.reduce((sum, trip) => sum + trip.total_cost, 0);

    return (
        <main className="min-h-[calc(100vh-64px)] relative bg-[#040905] overflow-hidden">
            {/* Layout 5: Mystic Forest — Deep emerald greens, warm earthy tones */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop"
                    alt="Lush Mountains"
                    className="w-full h-full object-cover opacity-40 scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#040905] via-[#040905]/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#040905]/60 via-transparent to-[#040905]" />
            </div>

            {/* Mystic Ambient Glows */}
            <div className="absolute top-[10%] left-[-5%] w-[50%] h-[50%] bg-emerald-700/10 blur-[160px] rounded-full animate-pulse" />
            <div className="absolute bottom-[0%] right-[-5%] w-[40%] h-[40%] bg-amber-900/10 blur-[130px] rounded-full" />

            <div className="relative z-10 max-w-7xl mx-auto p-6 md:p-10">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                            Premium Travels
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tight leading-tight">
                            {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-200">World Traveler</span>
                        </h1>
                        <p className="text-white/60 text-lg font-medium max-w-lg leading-relaxed">
                            Discover the world's most beautiful destinations with your personal AI travel guide.
                        </p>
                    </div>
                    <Link
                        href="/generate-trip"
                        className="group px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all shadow-lg shadow-emerald-500/20 transform hover:scale-[1.05] active:scale-[0.98] flex items-center gap-3 border border-emerald-400/30"
                    >
                        <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                        Discover New Trails
                    </Link>
                </header>

                {/* Traveler Insights Bento Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
                    <div className="group bg-white/[0.02] border border-white/5 p-7 rounded-[2rem] backdrop-blur-md hover:bg-white/[0.05] hover:border-emerald-500/30 transition-all duration-500">
                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1 group-hover:text-emerald-300 transition-colors">Total Trips</p>
                        <h4 className="text-4xl font-black text-white">{trips.length}</h4>
                    </div>
                    <div className="group bg-white/[0.02] border border-white/5 p-7 rounded-[2rem] backdrop-blur-md hover:bg-white/[0.05] hover:border-amber-500/30 transition-all duration-500">
                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1 group-hover:text-amber-300 transition-colors">Travel Spend</p>
                        <h4 className="text-4xl font-black text-white">€{totalCost}</h4>
                    </div>
                    <div className="group bg-gradient-to-br from-emerald-500/5 to-amber-900/5 border border-white/5 p-7 rounded-[2rem] backdrop-blur-md relative overflow-hidden hover:scale-[1.02] transition-all duration-500">
                        <div className="relative z-10">
                            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Explorer Level</p>
                            <h4 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-amber-200">Global Voyager</h4>
                        </div>
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />
                    </div>
                </div>

                {/* Explore Destinations Section */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <span className="w-2 h-7 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]"></span>
                        Explore New Horizons
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {cities.map((city) => (
                            <div
                                key={city.name}
                                className="group relative h-80 rounded-3xl overflow-hidden border border-white/10 transition-all duration-500 hover:scale-[1.02] shadow-2xl"
                            >
                                {/* City Image Background */}
                                <img
                                    src={city.image}
                                    alt={city.name}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                                {/* Content */}
                                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                    <h3 className="text-3xl font-bold text-white mb-2">{city.name}</h3>
                                    <p className="text-white/80 mb-6 max-w-md line-clamp-2">
                                        {city.description}
                                    </p>
                                    <Link
                                        href="/generate-trip"
                                        className="inline-flex items-center justify-center px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors w-max"
                                    >
                                        Plan Trip
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                        Recent Journeys
                    </h2>

                    {trips.length === 0 ? (
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-16 text-center backdrop-blur-xl">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.5a2.5 2.5 0 012.5 2.5v.5m-1.5 5.5A2.5 2.5 0 0113.5 18a2.5 2.5 0 01-2.5-2.5V15a2 2 0 00-2-2H8a2 2 0 00-2 2v1.5a2.5 2.5 0 01-2.5 2.5H4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">No trips generated yet</h3>
                            <p className="text-white/40 mb-8 max-w-sm mx-auto">
                                You haven't started any adventures. Let our AI plan something special for you!
                            </p>
                            <Link
                                href="/generate-trip"
                                className="inline-block px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl transition-all"
                            >
                                Generate My First Trip
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {trips.map((trip) => (
                                <Link
                                    key={trip.id}
                                    href={`/trips/${trip.id}`}
                                    className="group bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02] backdrop-blur-xl relative overflow-hidden"
                                >
                                    {/* Trip Card Mini Glow */}
                                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-600/10 blur-2xl rounded-full group-hover:bg-blue-600/20 transition-colors" />

                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md mb-2">
                                            {trip.season} Season
                                        </div>
                                        <div className="text-white/30 text-xs">
                                            {new Date(trip.created_at).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                                        {trip.city}
                                    </h3>

                                    <div className="flex items-center gap-4 text-white/50 text-sm mb-6">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {trip.trip_days} Days
                                        </span>
                                        <span className="flex items-center gap-1 font-bold text-white/80">
                                            €{trip.total_cost}
                                        </span>
                                    </div>

                                    <div className="flex items-center text-blue-400 text-sm font-bold gap-2">
                                        View Itinerary
                                        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4 4H3" />
                                        </svg>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
