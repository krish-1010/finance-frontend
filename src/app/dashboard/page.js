"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Import Router
import api from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import { Wallet, TrendingUp, AlertTriangle, Loader2 } from "lucide-react"; // Added Loader2
import AddTransactionModal from "@/components/forms/AddTransactionModal";
import SpendingPieChart from "@/components/charts/SpendingPieChart";

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = () => {
    api
      .get("/dashboard")
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error("Auth Error:", err);
        // If 401, kick them to login
        if (err.response && err.response.status === 401) {
          router.push("/login");
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 1. Loading State
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin h-10 w-10 text-slate-900" />
      </div>
    );
  }

  // 2. Error/Empty State (Guard Clause) - Prevents crash
  if (!data) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold">Unable to load data.</h2>
        <button
          onClick={() => router.push("/login")}
          className="text-blue-600 underline"
        >
          Please Log In
        </button>
      </div>
    );
  }

  // 3. Safe Rendering (Data is guaranteed here)
  return (
    <main className="p-4 md:p-8 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 shadow-lg transition-all"
        >
          + Add Transaction
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Balance Card */}
        <Card>
          <CardHeader title="Total Balance" className="pb-2" />
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.summary.balance)}
            </div>
            <p className="text-xs text-slate-500">Net Cash Flow</p>
          </CardContent>
        </Card>

        {/* Expenses Card */}
        <Card>
          <CardHeader title="Monthly Spending" className="pb-2" />
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(
                data.summary.fixedExpenses + data.summary.variableExpenses
              )}
            </div>
            <p className="text-xs text-slate-500">
              Fixed: {formatCurrency(data.summary.fixedExpenses)}
            </p>
          </CardContent>
        </Card>

        {/* Health Card */}
        <Card>
          <CardHeader title="Financial Health" className="pb-2" />
          <CardContent>
            {data.insights.length > 0 ? (
              <div className="flex items-center text-amber-600 gap-2">
                <AlertTriangle size={20} />
                <span className="text-sm font-medium">
                  {data.insights[0].message}
                </span>
              </div>
            ) : (
              <div className="flex items-center text-green-600 gap-2">
                <TrendingUp size={20} />
                <span className="text-sm font-medium">All systems normal.</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chart Placeholder */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader
            title="Spending Breakdown"
            description="Where your money went this month"
          />
          <CardContent className="h-[300px]">
            {/* Fixed height is important for Recharts */}
            <SpendingPieChart />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader title="Recent Activity" description="Last transactions" />
          <CardContent>
            <div className="text-sm text-slate-500 text-center py-4">
              Transaction List Widget Coming Soon
            </div>
          </CardContent>
        </Card>
      </div>

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
      />
    </main>
  );
}
