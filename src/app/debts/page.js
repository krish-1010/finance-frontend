"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle, TrendingDown, ShieldCheck, Zap } from "lucide-react";
import AddDebtModal from "@/components/forms/AddDebtModal";

export default function DebtPage() {
  const [strategy, setStrategy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [extraPayment, setExtraPayment] = useState(0); // For simulation

  // Deferred async fetch to avoid calling setState synchronously inside effect
  const fetchStrategy = async (simulateExtra = extraPayment) => {
    // yield to event loop so subsequent setState is not synchronous inside an effect body
    await Promise.resolve();
    setLoading(true);
    try {
      const res = await api.get(`/debts/strategy?extra=${simulateExtra}`);
      setStrategy(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStrategy(extraPayment);
  }, [extraPayment]); // Re-fetch when simulation slider moves

  return (
    <main className="p-4 md:p-8 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Debt Manager
          </h1>
          <p className="text-slate-500">
            The Avalanche Method: Kill high interest first.
          </p>
        </div>
        <button
          onClick={() => {
            setIsModalOpen(true);
          }}
          className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-red-700"
        >
          + Add Liability
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">
            Total Debt Burden
          </h3>
          <div className="text-3xl font-bold text-red-600 mt-2">
            {loading ? "..." : formatCurrency(strategy?.totalDebt || 0)}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Active Loans</h3>
          <div className="text-3xl font-bold text-slate-900 mt-2">
            {loading ? "..." : strategy?.strategyReport?.length || 0}
          </div>
        </div>

        {/* Simulation Slider */}
        <div className="bg-slate-900 p-6 rounded-xl text-white shadow-lg">
          <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
            <Zap size={16} className="text-yellow-400" /> Snowball Simulator
          </h3>
          <div className="mt-4">
            <label className="text-xs text-slate-300">
              Extra monthly payment: {formatCurrency(extraPayment)}
            </label>
            <input
              type="range"
              min="0"
              max="20000"
              step="500"
              value={extraPayment}
              onChange={(e) => setExtraPayment(Number(e.target.value))}
              className="w-full mt-2 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* THE STRATEGY LIST */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Col: The Priority List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShieldCheck className="text-emerald-600" /> Your Payoff Priority
          </h2>

          {loading ? (
            <div>Calculating best route...</div>
          ) : (
            strategy?.strategyReport?.map((debt, index) => (
              <div
                key={index}
                className={`relative p-6 rounded-xl border-2 transition-all ${
                  index === 0
                    ? "bg-white border-emerald-500 shadow-lg scale-[1.01]"
                    : "bg-slate-50 border-slate-200 opacity-90"
                }`}
              >
                {index === 0 && (
                  <div className="absolute -top-3 left-6 bg-emerald-500 text-white text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide shadow-sm">
                    Priority Target
                  </div>
                )}

                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {debt.debtName}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Balance:{" "}
                      <span className="font-semibold text-slate-700">
                        {formatCurrency(debt.remaining)}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-red-600">
                      {debt.interest}% Interest
                    </div>
                    <p className="text-xs text-slate-400">APR</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-dashed border-slate-200 flex justify-between items-center">
                  <div className="text-sm">
                    Time to Freedom:{" "}
                    <span className="font-bold text-slate-900">
                      {debt.monthsToFree === "Infinity"
                        ? "Never (Increase Payment!)"
                        : `${debt.monthsToFree} Months`}
                    </span>
                  </div>
                  {index === 0 && (
                    <div className="text-sm font-bold text-emerald-600 animate-pulse">
                      Pay{" "}
                      {formatCurrency(
                        Number(debt.minimumPayment || 0) + extraPayment
                      )}{" "}
                      / month
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {!loading && strategy?.strategyReport?.length === 0 && (
            <div className="p-10 text-center bg-white rounded-xl border border-dashed">
              <TrendingDown className="mx-auto h-10 w-10 text-emerald-500 mb-2" />
              <h3 className="text-lg font-bold">You are Debt Free!</h3>
              <p className="text-slate-500">Time to focus on investing.</p>
            </div>
          )}
        </div>

        {/* Right Col: Educational Sidebar */}
        <div className="bg-blue-50 p-6 rounded-xl h-fit border border-blue-100">
          <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
            <AlertTriangle size={18} /> Why Avalanche?
          </h3>
          <p className="text-sm text-blue-800 leading-relaxed mb-4">
            We sort your debts by <strong>Interest Rate</strong>, not balance.
            Mathematically, this saves you the most money.
          </p>
          <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
            <li>Pay minimums on everything.</li>
            <li>
              Throw all extra cash at the <strong>Priority Target</strong> (Top
              card).
            </li>
            <li>Once paid, move that money to the next card.</li>
          </ul>
        </div>
      </div>

      <AddDebtModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchStrategy()}
      />
    </main>
  );
}
