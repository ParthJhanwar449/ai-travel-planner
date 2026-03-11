"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";
import dynamic from "next/dynamic";

const TripMap = dynamic(() => import("@/components/TripMap"), {
    ssr: false,
});

interface Activity {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    cost: number;
}

interface Hotel {
    name: string;
    price_per_night: number;
    latitude: number;
    longitude: number;
}

interface TripDetail {
    id: number;
    city: string;
    season: string;
    total_cost: number;
    hotel_total_cost?: number;
    attractions_cost?: number;
    trip_days: number;
    created_at: string;
    itinerary: {
        [day: string]: Activity[];
    };
    hotel?: Hotel;
}

export default function TripDetailPage() {
    const { id } = useParams();
    const router = useRouter();

    const [trip, setTrip] = useState<TripDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrip = async () => {
            try {
                const response = await api.get(`/trips/${id}`);
                setTrip(response.data);
            } catch (error) {
                console.error("Failed to load trip", error);
                // Redirecting to dashboard if trip not found is good
                router.push("/dashboard");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchTrip();
    }, [id, router]);

    if (loading) {
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

    if (!trip) {
        return (
            <div className="min-h-[calc(100vh-64px)] bg-[#040905] flex items-center justify-center p-6 text-center relative overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[120px] rounded-full" />
                <div className="relative z-10">
                    <h1 className="text-2xl font-black tracking-tight mb-4 uppercase">Journey Not Found</h1>
                    <Link href="/dashboard" className="text-emerald-400 font-bold hover:underline transition-all">Return to Dashboard</Link>
                </div>
            </div>
        );
    }

    const tripDays = trip.trip_days;
    const totalCost = trip.total_cost || 0;
    const hotelCost = trip.hotel_total_cost || 0;
    const attractionsCost = trip.attractions_cost || 0;

    const dailyBudget = tripDays > 0 ? totalCost / tripDays : 0;
    const dailyHotelCost = tripDays > 0 ? hotelCost / tripDays : 0;
    const dailyAttractionCost = tripDays > 0 ? attractionsCost / tripDays : 0;

    const hotelPercent = (hotelCost / totalCost) * 100;
    const attractionPercent = (attractionsCost / totalCost) * 100;

    return (
        <div className="min-h-[calc(100vh-64px)] relative bg-[#040905] overflow-hidden p-6 md:p-10">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/15 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-900/10 blur-[120px] rounded-full" />

            <div className="relative max-w-5xl mx-auto">
                {/* Header Card */}
                <header className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl p-8 mb-10 shadow-2xl flex flex-col lg:flex-row justify-between items-stretch gap-8">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <span className="uppercase tracking-[0.2em] text-xs font-bold text-white/50">Travel Itinerary</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                            {trip.city} Adventure
                        </h1>
                        <p className="text-white/50 mt-2 flex items-center gap-4 text-lg">
                            <span className="flex items-center gap-1">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {trip.trip_days} Days
                            </span>
                            <span className="flex items-center gap-1">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                                </svg>
                                {trip.season}
                            </span>
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row lg:flex-col gap-4 min-w-[300px]">
                        {/* Budget Summary */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex-1">
                            <p className="text-white/40 text-[10px] mb-4 uppercase tracking-widest font-bold">Trip Budget Summary</p>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs text-white/50 mb-1">
                                        <span>Lodging ({hotelPercent.toFixed(0)}%)</span>
                                        <span className="font-mono">€{hotelCost.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                        <div className="bg-amber-500 h-full transition-all duration-1000" style={{ width: `${hotelPercent}%` }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs text-white/50 mb-1">
                                        <span>Activities ({attractionPercent.toFixed(0)}%)</span>
                                        <span className="font-mono">€{attractionsCost.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                        <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${attractionPercent}%` }} />
                                    </div>
                                </div>
                                <div className="flex justify-between gap-4 text-sm font-black text-emerald-400 pt-2 border-t border-white/5">
                                    <span>Total:</span>
                                    <span className="text-xl">€{totalCost.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Daily Breakdown */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex-1 backdrop-blur-xl">
                            <h3 className="text-[10px] uppercase tracking-widest font-bold text-white/40 mb-4">
                                Daily Budget Breakdown
                            </h3>

                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                    <p className="text-white/30 text-[9px] uppercase tracking-tighter mb-1">
                                        Hotel
                                    </p>
                                    <p className="text-lg font-bold text-white">
                                        €{dailyHotelCost.toFixed(0)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-white/30 text-[9px] uppercase tracking-tighter mb-1">
                                        Activities
                                    </p>
                                    <p className="text-lg font-bold text-white">
                                        €{dailyAttractionCost.toFixed(0)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-white/30 text-[9px] uppercase tracking-tighter mb-1">
                                        Total
                                    </p>
                                    <p className="text-lg font-bold text-emerald-400">
                                        €{dailyBudget.toFixed(0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Interactive Map Section */}
                <div className="mb-10 bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
                    <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center gap-2">
                        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        <span className="text-white font-bold uppercase tracking-widest text-xs">Route Explorer</span>
                        <span className="text-amber-500 font-black ml-auto">€{trip.total_cost}</span>
                    </div>
                    <TripMap
                        itinerary={trip.itinerary}
                        hotel={trip.hotel}
                    />
                </div>

                {/* Hotel Section */}
                {trip.hotel && (
                    <div className="mb-10">
                        <div className="flex items-center gap-4 mb-6 sticky top-20 z-10 bg-[#040905]/50 backdrop-blur-md py-2 -mx-2 px-2 rounded-lg">
                            <div className="px-4 py-1.5 bg-amber-600 text-white text-xs font-black uppercase tracking-widest rounded-full shadow-lg shadow-amber-900/40 border border-amber-400/20">
                                Lodging
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-tight">Your Hotel</h2>
                            <div className="flex-1 border-t border-white/5"></div>
                        </div>

                        <div className="group relative bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 p-8 rounded-3xl transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-amber-900/20">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                                            <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tight group-hover:text-amber-400 transition-colors">
                                            {trip.hotel.name}
                                        </h3>
                                    </div>

                                    <div className="space-y-3 text-white/50 text-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                                                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-white/80">€{trip.hotel.price_per_night} / night</span>
                                                <span className="text-xs text-white/40 italic">
                                                    Total: €{(trip.hotel_total_cost || (trip.hotel.price_per_night * trip.trip_days)).toLocaleString()} for {trip.trip_days} nights
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center shrink-0">
                                                <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                            <span className="text-xs">
                                                Lat: {trip.hotel.latitude.toFixed(4)}<br />
                                                Lng: {trip.hotel.longitude.toFixed(4)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="hidden md:block">
                                    <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <svg key={s} className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Itinerary Section */}
                <div className="space-y-12">
                    {Object.entries(trip.itinerary).map(([day, activities]) => (
                        <section key={day} className="relative">
                            {/* Sticky Day Label */}
                            <div className="flex items-center gap-4 mb-6 sticky top-20 z-10 bg-[#040905]/50 backdrop-blur-md py-2 -mx-2 px-2 rounded-lg">
                                <div className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-full shadow-lg shadow-emerald-900/40 border border-emerald-400/20">
                                    Day {day}
                                </div>
                                <h2 className="text-2xl font-black text-white tracking-tight">Daily Trail</h2>
                                <div className="flex-1 border-t border-white/5"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {activities.map((activity, idx) => (
                                    <div
                                        key={activity.id}
                                        className="group relative bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 p-6 rounded-3xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-900/40"
                                    >
                                        <h3 className="text-xl font-black text-white mb-3 group-hover:text-emerald-400 transition-colors uppercase tracking-tight">
                                            {activity.name}
                                        </h3>

                                        <div className="space-y-3 text-white/50 text-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <span className="font-semibold text-white/80">€{activity.cost}</span>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center shrink-0">
                                                    <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </div>
                                                <span className="text-xs">
                                                    Lat: {activity.latitude.toFixed(4)}<br />
                                                    Lng: {activity.longitude.toFixed(4)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                {/* Bottom Navigation */}
                <footer className="mt-16 flex justify-center gap-4">
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="px-8 py-3 rounded-2xl bg-white/[0.02] border border-white/5 text-white font-bold hover:bg-white/[0.05] transition-all uppercase tracking-widest text-xs"
                    >
                        Back to Dashboard
                    </button>
                </footer>
            </div>
        </div>
    );
}