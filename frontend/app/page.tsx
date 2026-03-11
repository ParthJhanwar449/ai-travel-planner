"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#040905] text-white relative overflow-hidden font-sans">
      {/* Background Visuals */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop"
          alt="Lush Mountains"
          className="w-full h-full object-cover opacity-20 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040905] via-[#040905]/60 to-transparent" />
      </div>

      {/* Ambient Glows */}
      <div className="absolute top-[20%] left-[-10%] w-[60%] h-[60%] bg-emerald-600/10 blur-[150px] rounded-full animate-pulse" />
      <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-amber-900/10 blur-[120px] rounded-full" />

      {/* Navigation Bar (Mini) */}
      <nav className="relative z-20 flex justify-between items-center p-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
          <span className="text-xl font-black tracking-tighter uppercase">VOYAGE<span className="text-emerald-400">PLANNER</span></span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-bold opacity-70 hover:opacity-100 transition-opacity uppercase tracking-widest">Login</Link>
          <Link href="/register" className="px-6 py-2 bg-emerald-600/20 border border-emerald-500/30 rounded-full text-sm font-bold hover:bg-emerald-600/40 transition-all uppercase tracking-widest">Join</Link>
        </div>
      </nav>

      {/* Hero Content */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-20 pb-32">
        <div className={`transition-all duration-1000 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            AI-Powered Travel Intelligence
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-none">
            CURATE YOUR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-200 to-amber-200">PERFECT JOURNEY</span>
          </h1>

          <p className="max-w-xl mx-auto text-white/50 text-lg md:text-xl font-medium leading-relaxed mb-12">
            Escape the ordinary. Our AI algorithms map out bespoke itineraries tailored to your unique travel DNA. From hidden forest trails to gourmet city escapes.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <Link
              href="/register"
              className="px-10 py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-lg transition-all shadow-2xl shadow-emerald-900/40 border border-emerald-400/20 uppercase tracking-widest transform hover:scale-[1.05] active:scale-[0.98]"
            >
              Start Curating
            </Link>
            <Link
              href="/login"
              className="px-10 py-5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-white font-bold rounded-2xl text-lg transition-all backdrop-blur-md uppercase tracking-widest"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Floating Features Bento (Mini) */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
          <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-xl text-left hover:border-emerald-500/30 transition-all duration-500 group">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Instant Itineraries</h3>
            <p className="text-white/40 text-sm leading-relaxed">Generate multi-day travel plans in seconds based on your specific interests and budget.</p>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-xl text-left hover:border-emerald-500/30 transition-all duration-500 group">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A2 2 0 013 15.483V8.416a2 2 0 011.134-1.758L9 4m0 16l5.447-2.724A2 2 0 0015 15.483V8.416a2 2 0 00-1.134-1.758L9 4m0 16V4" />
              </svg>
            </div>
            <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Personalized DNA</h3>
            <p className="text-white/40 text-sm leading-relaxed">Our AI learns your travel style to recommend destinations you'll actually love.</p>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-xl text-left hover:border-emerald-500/30 transition-all duration-500 group">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Smart Budgeting</h3>
            <p className="text-white/40 text-sm leading-relaxed">Optimization algorithms ensure you get the most value out of every trip.</p>
          </div>
        </div>
      </main>

      {/* Footer (Mini) */}
      <footer className="relative z-10 py-12 border-t border-white/5 text-center">
        <p className="text-white/20 text-xs font-bold uppercase tracking-widest">© 2026 VOYAGE PLANNER. CURATED ADVENTURES AWAIT.</p>
      </footer>
    </div>
  );
}
