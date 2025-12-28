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
        const [debtsRes, txRes] = await Promise.all([
          api.get("/debts/strategy"),
          api.get("/transactions?limit=1000"), // Try to get more history
        ]);
        const debts = debtsRes.data.strategyReport || [];
        const transactions = txRes.data || [];

        // 1. LIQUID CASH (Your "Wallet")
        // --- 1. CALCULATE BALANCE FROM HISTORY (The Fix) ---
        // Sum of (Income - Expenses)
        let calculatedBalance = 0;
        transactions.forEach((tx) => {
          if (tx.type === "INCOME") calculatedBalance += tx.amount;
          if (tx.type === "EXPENSE") calculatedBalance -= tx.amount;
          if (tx.type === "DEBT_PAYMENT") calculatedBalance -= tx.amount;
        });

        // --- 2. NET WORTH ---
        // Balance - Debt
        const totalDebt = debts.reduce((sum, d) => sum + d.remaining, 0);
        const netWorth = calculatedBalance - totalDebt; // Simplified: Cash - Debt

        // --- 3. BURN RATE (Last 30 Days) ---
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentExpenses = transactions.filter(
          (t) => t.type === "EXPENSE" && new Date(t.date) >= thirtyDaysAgo
        );

        const monthlyBurn =
          recentExpenses.reduce((sum, t) => sum + t.amount, 0) || 0;

        // --- 4. METRICS ---
        const dailyBurn = (monthlyBurn / 30).toFixed(0);

        // Safety check for runway (divide by zero)
        const runway =
          monthlyBurn > 0
            ? (calculatedBalance / monthlyBurn).toFixed(1)
            : calculatedBalance > 0
            ? "∞"
            : "0.0";

        setMetrics({
          walletBalance: calculatedBalance,
          netWorth,
          monthlyBurn,
          dailyBurn,
          runway,
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
