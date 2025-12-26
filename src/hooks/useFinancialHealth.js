import { useState, useEffect } from "react";
import api from "@/lib/api";

export function useFinancialHealth() {
  const [metrics, setMetrics] = useState({
    walletBalance: 0, // Liquid Cash
    netWorth: 0, // Assets - Debts
    dailyBurn: 0, // Avg Daily Expenses
    monthlyBurn: 0, // Avg Expenses
    runway: "0.0", // Months to survive
    loading: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Parallel Fetch: Get EVERYTHING
        const [assetsRes, debtsRes, txRes] = await Promise.all([
          api.get("/networth"), // Get Assets
          api.get("/debts/strategy"), // Get Debts
          api.get("/transactions"), // Get History
        ]);
        const assets = assetsRes.data.breakdown.assets;
        const debts = debtsRes.data.strategyReport;
        const transactions = txRes.data;

        // 1. LIQUID CASH (Your "Wallet")
        const liquidCash = assets
          .filter((a) => a.isLiquid)
          .reduce((sum, a) => sum + a.value, 0);

        // 2. NET WORTH
        const totalDebt = debts.reduce((sum, d) => sum + d.remaining, 0);
        const netWorth =
          assets.reduce((sum, a) => sum + a.value, 0) - totalDebt;

        // 3. TRUE BURN RATE (The "Survival Logic")
        // Logic: Sum of all expenses in the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentExpenses = transactions.filter(
          (t) => t.type === "EXPENSE" && new Date(t.date) >= thirtyDaysAgo
        );

        const monthlyBurn =
          recentExpenses.reduce((sum, t) => sum + t.amount, 0) || 1; // Avoid divide by zero

        // 4. METRICS
        const dailyBurn = (monthlyBurn / 30).toFixed(0);
        const runway = (liquidCash / monthlyBurn).toFixed(1);
        // const assets = assetsRes.data.breakdown.assets;
        // const debts = debtsRes.data.strategyReport;
        // const transactions = txRes.data;

        // // 1. Calculate Wallet Balance (Liquid Assets Only)
        // // In MyFinStack, this was manual. Here, it's auto-calculated from "Liquid" assets.
        // const liquidCash = assets
        //   .filter((a) => a.isLiquid)
        //   .reduce((sum, a) => sum + a.value, 0);

        // // 2. Calculate Net Worth (MyFinStack Logic)
        // // Total Assets - Total Debts
        // const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);
        // const totalDebt = debts.reduce((sum, d) => sum + d.remaining, 0);
        // const netWorth = totalAssets - totalDebt;

        // // 3. Calculate "True Monthly Burn" (MyFinStack Logic)
        // // We average the last 3 months of expenses
        // const expenses = transactions.filter((t) => t.type === "EXPENSE");
        // const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
        // // Rough estimate: Total Spent / (Unique Months found in data or default 1)
        // // For V1, let's just use Total Spent / 1 (Current Month) or hardcode logic
        // const monthlyBurn = totalExpense || 1;

        // // 4. Calculate Runway (The "Scary Number")
        // // Liquid Cash / Monthly Burn
        // const runway = (liquidCash / monthlyBurn).toFixed(1);

        setMetrics({
          walletBalance: liquidCash,
          netWorth,
          monthlyBurn,
          dailyBurn,
          runway: isFinite(runway) ? runway : "∞",
          loading: false,
        });
      } catch (err) {
        console.error("Failed to calculate health", err);
      }
    };

    fetchData();
  }, []);

  return metrics;
}
