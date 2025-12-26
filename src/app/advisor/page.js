"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Lock,
  ArrowRight,
} from "lucide-react";

export default function AdvisorPage() {
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/advisor")
      .then((res) => setAdvice(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return <div className="p-10 text-center">Analyzing your finances...</div>;

  // Determine Color Theme based on Status
  const getTheme = () => {
    switch (advice?.status) {
      case "CRITICAL":
        return "bg-red-50 border-red-200 text-red-900 icon-red-600";
      case "WARNING":
        return "bg-amber-50 border-amber-200 text-amber-900 icon-amber-600";
      case "HEALTHY":
        return "bg-emerald-50 border-emerald-200 text-emerald-900 icon-emerald-600";
      default:
        return "bg-slate-50";
    }
  };

  const theme = getTheme();
  const StatusIcon =
    advice?.status === "HEALTHY"
      ? TrendingUp
      : advice?.status === "WARNING"
      ? ShieldAlert
      : Lock;

  return (
    <main className="p-4 md:p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Investment Advisor
        </h1>
        <p className="text-slate-500">
          Automated guidance based on the Waterfall Method.
        </p>
      </div>

      {/* 1. THE VERDICT CARD */}
      <div
        className={`p-8 rounded-2xl border-2 ${theme
          .split(" ")
          .slice(0, 2)
          .join(" ")} shadow-sm`}
      >
        <div className="flex items-start gap-4">
          <div className={`p-3 bg-white rounded-xl shadow-sm`}>
            <StatusIcon
              size={32}
              className={theme.split(" ").pop().replace("icon-", "text-")}
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">{advice?.message}</h2>
            <p className="text-lg opacity-90">{advice?.action}</p>
          </div>
        </div>
      </div>

      {/* 2. THE PORTFOLIO RECOMMENDATION (Only if Healthy) */}
      {advice?.status === "HEALTHY" ? (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="text-emerald-600" /> Recommended Portfolio
          </h3>
          <p className="text-slate-500 text-sm">
            Based on a long-term aggressive growth strategy (Age &lt; 35).
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {advice?.suggestedPortfolio?.map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl text-slate-300">
                  {item.percentage}%
                </div>
                <h4 className="font-bold text-slate-900 text-lg relative z-10">
                  {item.type}
                </h4>
                <div className="h-1 w-12 bg-emerald-500 rounded-full my-3"></div>
                <p className="text-sm text-slate-500 relative z-10">
                  {item.reason}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-800 text-sm">
            <strong>Note:</strong> This is an educational suggestion (Index
            Funds/Gold). We do not recommend specific stocks. Please do your own
            research (DYOR).
          </div>
        </div>
      ) : (
        /* BLOCKED STATE (If Critical/Warning) */
        <div className="opacity-50 grayscale pointer-events-none select-none relative">
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="bg-slate-900 text-white px-6 py-3 rounded-full font-bold shadow-xl flex items-center gap-2">
              <Lock size={16} /> Unlock by fixing your{" "}
              {advice?.status === "CRITICAL" ? "Debt" : "Emergency Fund"}
            </div>
          </div>
          {/* Dummy Mockup of what they can't see yet */}
          <div className="grid md:grid-cols-4 gap-4 blur-sm">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Educational Path */}
      <div className="border-t pt-8">
        <h3 className="font-bold text-slate-900 mb-4">
          The Logic (Waterfall Method)
        </h3>
        <div className="flex flex-col md:flex-row gap-4 text-sm">
          <div
            className={`flex-1 p-4 rounded-lg border ${
              advice?.status === "CRITICAL"
                ? "bg-red-100 border-red-300 ring-2 ring-red-500"
                : "bg-slate-50"
            }`}
          >
            <strong className="block mb-1">Step 1: Toxic Debt</strong>
            <span className="text-slate-600">
              Pay off Credit Cards (&gt;12% interest). Guaranteed return.
            </span>
          </div>

          <div className="hidden md:flex items-center text-slate-300">
            <ArrowRight />
          </div>

          <div
            className={`flex-1 p-4 rounded-lg border ${
              advice?.status === "WARNING"
                ? "bg-amber-100 border-amber-300 ring-2 ring-amber-500"
                : "bg-slate-50"
            }`}
          >
            <strong className="block mb-1">Step 2: Safety Net</strong>
            <span className="text-slate-600">
              Save 6 months of expenses in Liquid Cash/FD.
            </span>
          </div>

          <div className="hidden md:flex items-center text-slate-300">
            <ArrowRight />
          </div>

          <div
            className={`flex-1 p-4 rounded-lg border ${
              advice?.status === "HEALTHY"
                ? "bg-emerald-100 border-emerald-300 ring-2 ring-emerald-500"
                : "bg-slate-50"
            }`}
          >
            <strong className="block mb-1">Step 3: Wealth</strong>
            <span className="text-slate-600">
              Invest in Equity/Gold for long-term compounding.
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
