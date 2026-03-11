"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { userService } from "@/services/user.service";

interface User {
    email: string;
    interest_culture: number;
    interest_nature: number;
    interest_food: number;
    interest_entertainment: number;
    budget_level: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await userService.getMe();
                setUser(data);
            } catch (error) {
                console.error("Failed to fetch profile", error);
                router.push("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [router]);

    if (loading) return (
        <div className="min-h-[calc(100vh-64px)] bg-[#040905] flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[120px] rounded-full" />
            <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(16,185,129,0.2)]"></div>
                <p className="text-white/60 animate-pulse font-bold tracking-widest uppercase text-xs">Accessing Your Itineraries...</p>
            </div>
        </div>
    );

    if (!user) return (
        <div className="min-h-[calc(100vh-64px)] bg-[#040905] flex items-center justify-center text-white p-6 text-center relative overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[120px] rounded-full" />
            <div className="relative z-10">
                <h1 className="text-2xl font-black tracking-tight mb-4 uppercase">Traveler Not Found</h1>
                <p className="text-white/40 mb-6">Your travel records seem to have been lost in the mist.</p>
                <button onClick={() => router.push("/login")} className="text-emerald-400 font-bold hover:underline transition-all uppercase tracking-widest text-xs">Return to Base</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#040905] text-white p-10 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-900/10 blur-[120px] rounded-full" />

            <div className="relative z-10 p-6 md:p-10 max-w-3xl mx-auto">
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 md:p-10 backdrop-blur-xl shadow-2xl">
                    <header className="flex flex-col md:flex-row items-center gap-6 mb-12">
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-900 rounded-3xl flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-emerald-500/10 border border-emerald-400/20">
                            {user.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-4xl font-black tracking-tight mb-2">Traveler Profile</h1>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-xs font-bold uppercase tracking-widest">
                                Voyager: {user.email}
                            </div>
                        </div>
                    </header>

                    <div className="space-y-8 mb-12">
                        <div className="bg-white/[0.01] border border-white/5 rounded-[2rem] p-8 hover:bg-white/[0.03] transition-all group">
                            <p className="text-white/40 text-xs font-black uppercase tracking-widest mb-3 group-hover:text-amber-500 transition-colors">Travel Budget</p>
                            <h4 className="text-3xl font-black capitalize text-white">{user.budget_level} Tier</h4>
                        </div>

                        <div className="bg-white/[0.01] border border-white/5 rounded-[2rem] p-8 hover:bg-white/[0.03] transition-all group">
                            <p className="text-white/40 text-xs font-black uppercase tracking-widest mb-6 group-hover:text-emerald-400 transition-colors">Traveler DNA</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                {[
                                    { label: "Culture", value: user.interest_culture, color: "from-emerald-500 to-emerald-800" },
                                    { label: "Nature", value: user.interest_nature, color: "from-teal-400 to-emerald-600" },
                                    { label: "Food", value: user.interest_food, color: "from-amber-400 to-orange-800" },
                                    { label: "Entertainment", value: user.interest_entertainment, color: "from-lime-400 to-emerald-600" }
                                ].map((interest) => (
                                    <div key={interest.label}>
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="text-white/60 text-sm font-bold">{interest.label}</p>
                                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/5 text-white/40">{(interest.value * 10).toFixed(0)}/10</span>
                                        </div>
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                            <div
                                                className={`h-full bg-gradient-to-r ${interest.color} rounded-full transition-all duration-1000`}
                                                style={{ width: `${interest.value * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => router.push("/onboarding")}
                            className="flex-1 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black transition-all shadow-lg shadow-emerald-900/40 border border-emerald-400/20 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Update Preferences
                        </button>

                        <button
                            onClick={() => router.push("/change-password")}
                            className="flex-1 px-8 py-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-white font-black rounded-2xl transition-all hover:border-emerald-500/30"
                        >
                            Change Password
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}