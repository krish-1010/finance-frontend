"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import api from "../lib/api";
import { ArrowRight, ShieldCheck, Zap, TrendingUp } from "lucide-react";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Quick check to see if we can hit a protected route
    api
      .get("/dashboard")
      .then(() => setIsLoggedIn(true))
      .catch(() => setIsLoggedIn(false));
  }, []);
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="text-2xl font-bold bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          Finance GPS
        </div>
        <div className="space-x-4">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-slate-600 hover:text-slate-900 font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/login"
                className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 space-y-8 mt-10 mb-20">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 max-w-4xl">
          Stop using Excel.
          <br />
          <span className="text-emerald-600">Start building wealth.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl">
          A personal finance tool built for the modern Indian. Track
          investments, manage debt, and calculate your FIRE number without the
          complexity.
        </p>

        <div className="flex gap-4">
          <Link
            href="/login"
            className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
          >
            Start Your Journey <ArrowRight size={20} />
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-6xl text-left">
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600 mb-4">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Debt Avalanche</h3>
            <p className="text-slate-500">
              Visualize your path to being debt-free. We calculate exactly which
              loan to kill first.
            </p>
          </div>
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Safe Investing</h3>
            <p className="text-slate-500">
              Dont gamble. Follow our Waterfall Method to build a safe,
              inflation-proof portfolio.
            </p>
          </div>
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 mb-4">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">FIRE Calculator</h3>
            <p className="text-slate-500">
              Know exactly how much you need to retire early in India, adjusted
              for 7% inflation.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
