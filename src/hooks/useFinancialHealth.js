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
        const [debtsRes, txRes] = await Promise.all([
          api.get("/debts/strategy"),
          api.get("/transactions?limit=1000"),
        ]);

        const debts = debtsRes.data.strategyReport || [];

        // --- THE FIX IS HERE ---
        // Handle both simple array AND new paginated response { data: [], meta: {} }
        const rawTx = txRes.data;
        const transactions = Array.isArray(rawTx) ? rawTx : rawTx.data || [];
        // -----------------------

        // 1. LIQUID CASH
        let calculatedBalance = 0;
        transactions.forEach((tx) => {
          if (tx.type === "INCOME") calculatedBalance += tx.amount;
          if (tx.type === "EXPENSE") calculatedBalance -= tx.amount;
          if (tx.type === "DEBT_PAYMENT") calculatedBalance -= tx.amount;
        });

        // 2. NET WORTH
        const totalDebt = debts.reduce((sum, d) => sum + d.remaining, 0);
        const netWorth = calculatedBalance - totalDebt;

        // 3. BURN RATE (Last 30 Days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentExpenses = transactions.filter(
          (t) => t.type === "EXPENSE" && new Date(t.date) >= thirtyDaysAgo
        );

        const monthlyBurn =
          recentExpenses.reduce((sum, t) => sum + t.amount, 0) || 0;

        // 4. METRICS
        const dailyBurn = (monthlyBurn / 30).toFixed(0);
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
        setMetrics((prev) => ({ ...prev, loading: false })); // Stop loading on error
      }
    };

    fetchData();
  }, []);

  return metrics;
}
