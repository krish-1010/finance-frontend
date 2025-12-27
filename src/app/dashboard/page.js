"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import { useFinancialHealth } from "@/hooks/useFinancialHealth";
import {
  Wallet,
  TrendingUp,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Target,
} from "lucide-react";

// Components
import AddTransactionModal from "@/components/forms/AddTransactionModal";
import ProcessBillsModal from "@/components/forms/ProcessBillsModal";

// Charts
import SpendingPieChart from "@/components/charts/SpendingPieChart";
import BurnRateChart from "@/components/charts/BurnRateChart";
import RunwayGauge from "@/components/charts/RunwayGauge";

export default function Dashboard() {
  const router = useRouter();

  // 1. Local Dashboard Data
  const [data, setData] = useState(null);
  const [goals, setGoals] = useState([]); // [RESTORED] Sinking Funds
  const [loading, setLoading] = useState(true);

  // 2. Modals State
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isBillsModalOpen, setIsBillsModalOpen] = useState(false);

  // 3. The "Brain" Metrics
  const metrics = useFinancialHealth();

  // 4. Data for Burn Rate Chart (From V2)
  // You can eventually replace the static numbers with real historical data
  const burnRateData = [
    { name: "Oct", income: 45000, expense: 32000 },
    { name: "Nov", income: 48000, expense: 41000 },
    { name: "Dec", income: 50000, expense: metrics.monthlyBurn || 0 },
  ];

  // 5. Fetch Data (Restored Promise.all from V1 to get Goals + Dashboard)
  const fetchData = useCallback(async () => {
    try {
      const [dashRes, goalsRes] = await Promise.all([
        api.get("/dashboard"),
        api.get("/goals"), // Fetch Sinking Funds
      ]);
      setData(dashRes.data);
      setGoals(goalsRes.data);
    } catch (err) {
      console.error("Auth Error:", err);
      if (err.response && err.response.status === 401) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin h-10 w-10 text-slate-900" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <main className="p-4 md:p-8 space-y-6 bg-slate-50 min-h-screen">
      {/* --- SECTION 1: HEADER & ACTIONS --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="text-slate-500">Financial GPS Active 🛰️</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => setIsBillsModalOpen(true)}
            className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm flex items-center justify-center gap-2 transition-all"
          >
            <Wallet size={16} /> Pay Bills
          </button>
          <button
            onClick={() => setIsTransactionModalOpen(true)}
            className="flex-1 md:flex-none bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg transition-all"
          >
            + Add Transaction
          </button>
        </div>
      </div>

      {/* --- SECTION 2: SUMMARY CARDS (From V2) --- */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Balance */}
        <Card>
          <CardHeader title="Liquid Cash" className="pb-2" />
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(data.summary.balance)}
            </div>
            <p className="text-xs text-slate-500">Available in Wallet</p>
          </CardContent>
        </Card>

        {/* Expenses */}
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

        {/* Health */}
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

      {/* --- SECTION 3: THE BRAIN (Insights) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Runway Gauge (Both) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center h-64">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Survival Runway
          </h3>
          <div className="w-full h-40">
            <RunwayGauge months={metrics.runway} />
          </div>
          <p className="text-xs text-center text-slate-400 mt-2">
            Target: &gt; 6.0 Months
          </p>
        </div>

        {/* 2. Burn Rate Chart (From V2) */}
        <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-64">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            Income vs Expense Trend
          </h3>
          <div className="w-full h-48">
            <BurnRateChart data={burnRateData} />
          </div>
        </div>
      </div>

      {/* --- SECTION 4: DAILY BURN BANNER --- */}
      {/* (Restored V1 Progress Bar + V2 Layout) */}
      <div className="bg-slate-900 rounded-2xl p-6 md:p-8 text-white flex flex-col justify-center relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-4">
          <div className="w-full">
            <h2 className="text-xl md:text-2xl font-bold mb-1">
              Daily Cost of Living
            </h2>
            <p className="text-slate-400 text-sm mb-4">
              You spend approximately{" "}
              <span className="text-emerald-400 font-bold text-lg">
                {formatCurrency(metrics.dailyBurn || 0)}
              </span>{" "}
              every single day to survive.
            </p>
            {/* V1 Progress Bar Feature */}
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden max-w-md">
              <div className="h-full bg-emerald-500 w-[40%]"></div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Keep this number low to extend your runway.
            </p>
          </div>
          <div className="h-12 w-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
            <TrendingUp size={24} className="text-emerald-400" />
          </div>
        </div>
      </div>

      {/* --- SECTION 5: SINKING FUNDS (Restored from V1) --- */}
      {goals.length > 0 && (
        <Card>
          <CardHeader
            title="Sinking Funds (Goals)"
            description="Progress towards big future bills"
          />
          <CardContent>
            <div className="space-y-4">
              {goals.map((goal) => {
                const percent = Math.min(
                  (goal.savedAmount / goal.targetAmount) * 100,
                  100
                );
                return (
                  <div key={goal._id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium flex items-center gap-2">
                        <Target size={14} className="text-indigo-500" />
                        {goal.title}
                      </span>
                      <span className="text-slate-500">
                        {formatCurrency(goal.savedAmount)} /{" "}
                        {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* --- SECTION 6: BREAKDOWN & ACTIVITY --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Spending Pie Chart */}
        <Card className="col-span-4">
          <CardHeader
            title="Spending Breakdown"
            description="Where your money went this month"
          />
          <CardContent className="h-75">
            <SpendingPieChart />
          </CardContent>
        </Card>

        {/* Recent Activity List (V2 Style with View All) */}
        <Card className="col-span-3">
          <CardHeader
            title="Recent Activity"
            description="Last 5 transactions"
          />
          <CardContent>
            {data.recentTransactions && data.recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {data.recentTransactions.map((tx) => (
                  <div
                    key={tx._id}
                    className="flex justify-between items-center border-b border-slate-50 pb-2 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {tx.description}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(tx.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`font-bold ${
                        tx.type === "INCOME"
                          ? "text-green-600"
                          : "text-slate-900"
                      }`}
                    >
                      {tx.type === "INCOME" ? "+" : "-"}{" "}
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
                <button
                  onClick={() => router.push("/transactions")}
                  className="w-full text-xs text-indigo-600 font-bold mt-2 flex items-center justify-center gap-1 hover:underline"
                >
                  View All <ArrowRight size={12} />
                </button>
              </div>
            ) : (
              <div className="text-sm text-slate-500 text-center py-10">
                No recent transactions
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* --- MODALS --- */}
      <AddTransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSuccess={fetchData}
      />

      <ProcessBillsModal
        isOpen={isBillsModalOpen}
        onClose={() => setIsBillsModalOpen(false)}
      />
    </main>
  );
}

// "use client";

// import { useEffect, useState, useCallback } from "react";
// import { useRouter } from "next/navigation";
// import api from "@/lib/api";
// import { Card, CardContent, CardHeader } from "@/components/ui/Card";
// import { formatCurrency } from "@/lib/utils";
// import { useFinancialHealth } from "@/hooks/useFinancialHealth";
// import { Wallet, TrendingUp, AlertTriangle, Loader2, ArrowRight, Target } from "lucide-react";

// // Components
// import AddTransactionModal from "@/components/forms/AddTransactionModal";
// import ProcessBillsModal from "@/components/forms/ProcessBillsModal";

// // Charts
// import SpendingPieChart from "@/components/charts/SpendingPieChart";
// import BurnRateChart from "@/components/charts/BurnRateChart";
// import RunwayGauge from "@/components/charts/RunwayGauge";

// export default function Dashboard() {
//   const router = useRouter();

//   // 1. Local Dashboard Data
//   const [data, setData] = useState(null);
//   const [goals, setGoals] = useState([]); // [NEW] Sinking Funds
//   const [loading, setLoading] = useState(true);

//   // 2. Modals
//   const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
//   const [isBillsModalOpen, setIsBillsModalOpen] = useState(false);

//   // 3. The "Brain" Metrics - FIXED THE ERROR HERE
//   const metrics = useFinancialHealth();

//   // 4. Fetch Data
//   const fetchData = useCallback(async () => {
//     try {
//       const [dashRes, goalsRes] = await Promise.all([
//         api.get("/dashboard"),
//         api.get("/goals") // Fetch Sinking Funds
//       ]);
//       setData(dashRes.data);
//       setGoals(goalsRes.data); // Assuming backend returns array of goals
//     } catch (err) {
//       console.error("Auth Error:", err);
//       if (err.response && err.response.status === 401) {
//         router.push("/login");
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, [router]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin"/></div>;
//   if (!data) return null;

//   // Prepare Chart Data
//   const burnRateData = [
//     { name: "Current", income: data.summary.income || 0, expense: data.summary.fixedExpenses + data.summary.variableExpenses },
//     { name: "Avg", income: metrics.income || 0, expense: metrics.monthlyBurn || 0 },
//   ];

//   return (
//     <main className="p-4 md:p-8 space-y-6 bg-slate-50 min-h-screen">

//       {/* HEADER */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//         <div>
//            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
//            <p className="text-slate-500">Financial GPS Active 🛰️</p>
//         </div>
//         <div className="flex gap-2">
//             <button onClick={() => setIsBillsModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
//                 <Wallet size={16} /> Pay Bills
//             </button>
//             <button onClick={() => setIsTransactionModalOpen(true)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium">
//                 + Add Transaction
//             </button>
//         </div>
//       </div>

//       {/* BRAIN METRICS (Runway & Daily Burn) */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {/* Runway Gauge */}
//         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
//            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Survival Runway</h3>
//            <div className="w-full h-32">
//               <RunwayGauge months={metrics.runway} />
//            </div>
//            <p className="text-xs text-center text-slate-400 mt-2">Target: &gt; 6.0 Months</p>
//         </div>

//         {/* Daily Burn Banner */}
//         <div className="col-span-1 md:col-span-2 bg-slate-900 rounded-2xl p-6 text-white flex flex-col justify-center relative overflow-hidden shadow-lg">
//            <div className="relative z-10">
//               <h2 className="text-xl font-bold mb-1">Daily Cost of Living</h2>
//               <p className="text-slate-400 text-sm mb-4">
//                   You spend <span className="text-emerald-400 font-bold text-lg">₹{metrics.dailyBurn || 0}</span> every day to survive.
//               </p>
//               <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
//                   <div className="h-full bg-emerald-500 w-[40%]"></div>
//               </div>
//               <p className="text-xs text-slate-500 mt-2">Keep this number low to extend your runway.</p>
//            </div>
//            <TrendingUp className="absolute right-4 bottom-4 text-slate-800 h-32 w-32" />
//         </div>
//       </div>

//       {/* SINKING FUNDS (The "Wifi" Tracker from Old App) */}
//       {goals.length > 0 && (
//         <Card>
//             <CardHeader title="Sinking Funds (Goals)" description="Progress towards big future bills" />
//             <CardContent>
//                 <div className="space-y-4">
//                     {goals.map(goal => {
//                         const percent = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
//                         return (
//                             <div key={goal._id}>
//                                 <div className="flex justify-between text-sm mb-1">
//                                     <span className="font-medium">{goal.title}</span>
//                                     <span className="text-slate-500">{formatCurrency(goal.savedAmount)} / {formatCurrency(goal.targetAmount)}</span>
//                                 </div>
//                                 <div className="w-full bg-slate-100 rounded-full h-2.5">
//                                     <div className="bg-blue-600 h-2.5 rounded-full transition-all" style={{ width: `${percent}%` }}></div>
//                                 </div>
//                             </div>
//                         )
//                     })}
//                 </div>
//             </CardContent>
//         </Card>
//       )}

//       {/* SUMMARY & CHARTS */}
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
//         <Card className="col-span-4">
//           <CardHeader title="Spending Breakdown" />
//           <CardContent className="h-[300px]">
//             <SpendingPieChart />
//           </CardContent>
//         </Card>
//         <Card className="col-span-3">
//             <CardHeader title="Recent Activity" />
//             <CardContent>
//                 {data.recentTransactions?.map((tx) => (
//                     <div key={tx._id} className="flex justify-between items-center border-b border-slate-50 pb-2 mb-2 last:border-0">
//                         <div>
//                             <p className="font-medium text-sm">{tx.description}</p>
//                             <p className="text-xs text-slate-400">{new Date(tx.date).toLocaleDateString()}</p>
//                         </div>
//                         <span className={`font-bold text-sm ${tx.type === 'INCOME' ? 'text-green-600' : 'text-slate-900'}`}>
//                             {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(tx.amount)}
//                         </span>
//                     </div>
//                 ))}
//             </CardContent>
//         </Card>
//       </div>

//       <AddTransactionModal isOpen={isTransactionModalOpen} onClose={() => setIsTransactionModalOpen(false)} onSuccess={fetchData} />
//       <ProcessBillsModal isOpen={isBillsModalOpen} onClose={() => setIsBillsModalOpen(false)} />
//     </main>
//   );
// }
// // "use client";

// // import { useEffect, useState, useCallback } from "react";
// // import { useRouter } from "next/navigation";
// // import api from "@/lib/api";
// // import { Card, CardContent, CardHeader } from "@/components/ui/Card";
// // import { formatCurrency } from "@/lib/utils";
// // import { useFinancialHealth } from "@/hooks/useFinancialHealth";
// // import {
// //   Wallet,
// //   TrendingUp,
// //   AlertTriangle,
// //   Loader2,
// //   ArrowRight,
// // } from "lucide-react";

// // // Components
// // import AddTransactionModal from "@/components/forms/AddTransactionModal";
// // import ProcessBillsModal from "@/components/forms/ProcessBillsModal"; // [NEW]

// // // Charts
// // import SpendingPieChart from "@/components/charts/SpendingPieChart";
// // import BurnRateChart from "@/components/charts/BurnRateChart"; // [NEW]
// // import RunwayGauge from "@/components/charts/RunwayGauge"; // [NEW]

// // export default function Dashboard() {
// //   const router = useRouter();

// //   // 1. Local Dashboard Data (Balance, Summary)
// //   const [data, setData] = useState(null);
// //   const [loading, setLoading] = useState(true);

// //   // 2. Modals State
// //   const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
// //   const [isBillsModalOpen, setIsBillsModalOpen] = useState(false); // [NEW]

// //   // 3. The "Brain" Metrics (Runway, Daily Burn)
// //   // const { metrics } = useFinancialHealth();
// //   const metrics = useFinancialHealth();

// //   // Mock data for BurnRateChart (Replace with real analytics data later)
// //   const burnRateData = [
// //     { name: "Oct", income: 45000, expense: 32000 },
// //     { name: "Nov", income: 48000, expense: 41000 },
// //     { name: "Dec", income: 50000, expense: metrics.monthlyBurn || 0 },
// //   ];

// //   const fetchData = useCallback(() => {
// //     api
// //       .get("/dashboard")
// //       .then((res) => setData(res.data))
// //       .catch((err) => {
// //         console.error("Auth Error:", err);
// //         if (err.response && err.response.status === 401) {
// //           router.push("/login");
// //         }
// //       })
// //       .finally(() => setLoading(false));
// //   }, [router]);

// //   useEffect(() => {
// //     fetchData();
// //   }, [fetchData]);

// //   if (loading) {
// //     return (
// //       <div className="flex h-screen items-center justify-center bg-slate-50">
// //         <Loader2 className="animate-spin h-10 w-10 text-slate-900" />
// //       </div>
// //     );
// //   }

// //   if (!data) return null;

// //   return (
// //     <main className="p-4 md:p-8 space-y-6 bg-slate-50 min-h-screen">
// //       {/* --- SECTION 1: HEADER & ACTIONS --- */}
// //       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
// //         <div>
// //           <h1 className="text-3xl font-bold tracking-tight text-slate-900">
// //             Dashboard
// //           </h1>
// //           <p className="text-slate-500">Overview of your wealth and runway.</p>
// //         </div>

// //         <div className="flex gap-2 w-full md:w-auto">
// //           {/* [NEW] Pay Bills Button */}
// //           <button
// //             onClick={() => setIsBillsModalOpen(true)}
// //             className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm flex items-center justify-center gap-2 transition-all"
// //           >
// //             <Wallet size={16} /> Pay Bills
// //           </button>

// //           {/* Add Transaction Button */}
// //           <button
// //             onClick={() => setIsTransactionModalOpen(true)}
// //             className="flex-1 md:flex-none bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg transition-all"
// //           >
// //             + Add Transaction
// //           </button>
// //         </div>
// //       </div>

// //       {/* --- SECTION 2: SUMMARY CARDS (Existing) --- */}
// //       <div className="grid gap-4 md:grid-cols-3">
// //         {/* Balance */}
// //         <Card>
// //           <CardHeader title="Liquid Cash" className="pb-2" />
// //           <CardContent>
// //             <div className="text-2xl font-bold text-slate-900">
// //               {formatCurrency(data.summary.balance)}
// //             </div>
// //             <p className="text-xs text-slate-500">Available in Wallet</p>
// //           </CardContent>
// //         </Card>

// //         {/* Expenses */}
// //         <Card>
// //           <CardHeader title="Monthly Spending" className="pb-2" />
// //           <CardContent>
// //             <div className="text-2xl font-bold text-red-600">
// //               {formatCurrency(
// //                 data.summary.fixedExpenses + data.summary.variableExpenses
// //               )}
// //             </div>
// //             <p className="text-xs text-slate-500">
// //               Fixed: {formatCurrency(data.summary.fixedExpenses)}
// //             </p>
// //           </CardContent>
// //         </Card>

// //         {/* Health */}
// //         <Card>
// //           <CardHeader title="Financial Health" className="pb-2" />
// //           <CardContent>
// //             {data.insights.length > 0 ? (
// //               <div className="flex items-center text-amber-600 gap-2">
// //                 <AlertTriangle size={20} />
// //                 <span className="text-sm font-medium">
// //                   {data.insights[0].message}
// //                 </span>
// //               </div>
// //             ) : (
// //               <div className="flex items-center text-green-600 gap-2">
// //                 <TrendingUp size={20} />
// //                 <span className="text-sm font-medium">All systems normal.</span>
// //               </div>
// //             )}
// //           </CardContent>
// //         </Card>
// //       </div>

// //       {/* --- SECTION 3: THE BRAIN (Insights) [NEW] --- */}
// //       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
// //         {/* 1. Runway Gauge */}
// //         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center h-64">
// //           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
// //             Survival Runway
// //           </h3>
// //           <div className="w-full h-40">
// //             <RunwayGauge months={metrics.runway} />
// //           </div>
// //           <p className="text-xs text-center text-slate-400 mt-2">
// //             Target: &gt; 6.0 Months
// //           </p>
// //         </div>

// //         {/* 2. Burn Rate Chart */}
// //         <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-64">
// //           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
// //             Income vs Expense Trend
// //           </h3>
// //           <div className="w-full h-48">
// //             <BurnRateChart data={burnRateData} />
// //           </div>
// //         </div>
// //       </div>

// //       {/* --- SECTION 4: DAILY BURN BANNER [NEW] --- */}
// //       <div className="bg-slate-900 rounded-2xl p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-lg gap-4">
// //         <div>
// //           <h2 className="text-xl md:text-2xl font-bold mb-1">
// //             Daily Cost of Living
// //           </h2>
// //           <p className="text-slate-400 text-sm">
// //             You spend approximately{" "}
// //             <span className="text-emerald-400 font-bold text-lg">
// //               ₹{metrics.dailyBurn || 0}
// //             </span>{" "}
// //             every single day to survive.
// //           </p>
// //         </div>
// //         <div className="h-12 w-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
// //           <TrendingUp size={24} className="text-emerald-400" />
// //         </div>
// //       </div>

// //       {/* --- SECTION 5: BREAKDOWN & ACTIVITY --- */}
// //       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
// //         {/* Spending Pie Chart */}
// //         <Card className="col-span-4">
// //           <CardHeader
// //             title="Spending Breakdown"
// //             description="Where your money went this month"
// //           />
// //           <CardContent className="h-75">
// //             <SpendingPieChart />
// //           </CardContent>
// //         </Card>

// //         {/* Recent Activity List */}
// //         <Card className="col-span-3">
// //           <CardHeader
// //             title="Recent Activity"
// //             description="Last 5 transactions"
// //           />
// //           <CardContent>
// //             {/* If data.recentTransactions exists, map it. Else show empty state */}
// //             {data.recentTransactions && data.recentTransactions.length > 0 ? (
// //               <div className="space-y-4">
// //                 {data.recentTransactions.map((tx) => (
// //                   <div
// //                     key={tx._id}
// //                     className="flex justify-between items-center border-b border-slate-50 pb-2 last:border-0"
// //                   >
// //                     <div>
// //                       <p className="font-medium text-slate-900">
// //                         {tx.description}
// //                       </p>
// //                       <p className="text-xs text-slate-500">
// //                         {new Date(tx.date).toLocaleDateString()}
// //                       </p>
// //                     </div>
// //                     <span
// //                       className={`font-bold ${
// //                         tx.type === "INCOME"
// //                           ? "text-green-600"
// //                           : "text-slate-900"
// //                       }`}
// //                     >
// //                       {tx.type === "INCOME" ? "+" : "-"}{" "}
// //                       {formatCurrency(tx.amount)}
// //                     </span>
// //                   </div>
// //                 ))}
// //                 <button
// //                   onClick={() => router.push("/transactions")}
// //                   className="w-full text-xs text-indigo-600 font-bold mt-2 flex items-center justify-center gap-1 hover:underline"
// //                 >
// //                   View All <ArrowRight size={12} />
// //                 </button>
// //               </div>
// //             ) : (
// //               <div className="text-sm text-slate-500 text-center py-10">
// //                 No recent transactions
// //               </div>
// //             )}
// //           </CardContent>
// //         </Card>
// //       </div>

// //       {/* --- MODALS --- */}
// //       <AddTransactionModal
// //         isOpen={isTransactionModalOpen}
// //         onClose={() => setIsTransactionModalOpen(false)}
// //         onSuccess={fetchData}
// //       />

// //       <ProcessBillsModal
// //         isOpen={isBillsModalOpen}
// //         onClose={() => setIsBillsModalOpen(false)}
// //       />
// //     </main>
// //   );
// // }
