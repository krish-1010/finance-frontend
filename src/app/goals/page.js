"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Target, TrendingUp, Landmark, Flame } from "lucide-react";
import AddAssetModal from "@/components/forms/AddAssetModal";

export default function GoalsPage() {
  const [fireData, setFireData] = useState(null);
  const [netWorthData, setNetWorthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helper to fetch data safely
  const loadData = async () => {
    setLoading(true);
    try {
      // Parallel Fetch for speed
      const [fireRes, netWorthRes] = await Promise.all([
        api.get("/fire"),
        api.get("/networth"),
      ]);
      setFireData(fireRes.data);
      setNetWorthData(netWorthRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <main className="p-4 md:p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Wealth & FIRE
          </h1>
          <p className="text-slate-500">Your path to financial freedom.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-emerald-700"
        >
          + Add Asset
        </button>
      </div>

      {/* 1. NET WORTH SECTION */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Total Assets */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-500 uppercase">
              Total Assets
            </h3>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {loading ? "..." : formatCurrency(netWorthData?.totalAssets || 0)}
          </div>
        </div>

        {/* Total Debt (Pulled from Net Worth API) */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <Landmark size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-500 uppercase">
              Total Liabilities
            </h3>
          </div>
          <div className="text-2xl font-bold text-red-600">
            {loading
              ? "..."
              : `-${formatCurrency(netWorthData?.totalDebt || 0)}`}
          </div>
        </div>

        {/* Real Net Worth */}
        <div className="bg-slate-900 p-6 rounded-xl text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-slate-700 text-yellow-400 rounded-lg">
              <Target size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-400 uppercase">
              Real Net Worth
            </h3>
          </div>
          <div className="text-3xl font-bold">
            {loading ? "..." : formatCurrency(netWorthData?.netWorth || 0)}
          </div>
        </div>
      </div>

      {/* 2. FIRE CALCULATOR SECTION */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-orange-500 rounded-full shadow-lg shadow-orange-500/20">
              <Flame size={24} className="text-white" fill="white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">F.I.R.E Progress</h2>
              <p className="text-indigo-200 text-sm">
                Financial Independence, Retire Early
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-3xl font-bold">
                  {fireData?.metrics?.progress || 0}%
                </span>
                <span className="text-sm text-indigo-300">of Freedom Goal</span>
              </div>

              {/* Progress Bar */}
              <div className="h-4 w-full bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-400 to-pink-500 transition-all duration-1000 ease-out"
                  style={{
                    width: `${Math.min(
                      fireData?.metrics?.progress || 0,
                      100
                    )}%`,
                  }}
                ></div>
              </div>

              <div className="mt-4 flex justify-between text-sm">
                <div>
                  <p className="text-slate-400">Current Saved</p>
                  <p className="font-bold text-lg">
                    {formatCurrency(fireData?.metrics?.currentNetWorth || 0)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400">Target (25x Expense)</p>
                  <p className="font-bold text-lg text-emerald-400">
                    {formatCurrency(fireData?.metrics?.fireTarget || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm border border-white/10">
              <h3 className="font-bold mb-4 text-indigo-200">
                The Math (Why this number?)
              </h3>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex justify-between">
                  <span>Avg Monthly Expense:</span>
                  <span className="font-bold text-white">
                    {formatCurrency(
                      fireData?.metrics?.averageMonthlySpend || 0
                    )}
                  </span>
                </li>
                <li className="flex justify-between border-b border-white/10 pb-3">
                  <span>Annual Expense:</span>
                  <span className="font-bold text-white">
                    {formatCurrency(
                      (fireData?.metrics?.averageMonthlySpend || 0) * 12
                    )}
                  </span>
                </li>
                <li className="pt-1 text-center text-xs text-orange-300 font-medium">
                  We multiply your annual expense by 25. Once you save this
                  amount, the interest alone (4%) covers your life expenses
                  forever.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ASSET LIST */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Your Assets</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {netWorthData?.breakdown?.assets?.map((asset) => (
            <div
              key={asset._id}
              className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-800">{asset.name}</h4>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full uppercase font-bold tracking-wider">
                    {asset.type}
                  </span>
                </div>
                {asset.isLiquid && (
                  <div
                    title="Liquid (Emergency Safe)"
                    className="w-2 h-2 rounded-full bg-emerald-500"
                  ></div>
                )}
              </div>
              <div className="text-xl font-bold text-slate-900">
                {formatCurrency(asset.value)}
              </div>
            </div>
          ))}

          {/* Empty State */}
          {!loading && netWorthData?.breakdown?.assets?.length === 0 && (
            <div className="col-span-full p-8 text-center bg-slate-100 rounded-xl border border-dashed border-slate-300">
              <p className="text-slate-500">No assets added yet.</p>
              <p className="text-sm text-slate-400">
                Add Savings, Gold, or Investments to see your Net Worth.
              </p>
            </div>
          )}
        </div>
      </div>

      <AddAssetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
      />
    </main>
  );
}
