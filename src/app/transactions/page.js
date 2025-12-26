"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Search,
} from "lucide-react";
import AddTransactionModal from "@/components/forms/AddTransactionModal";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState("ALL"); // ALL, INCOME, EXPENSE

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get("/transactions");
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions((prev) => prev.filter((t) => t._id !== id)); // Optimistic update
    } catch (err) {
      alert("Failed to delete");
    }
  };

  // Filter Logic
  const filteredData = transactions.filter((t) => {
    if (filter === "ALL") return true;
    return t.type === filter;
  });

  return (
    <main className="p-4 md:p-8 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-slate-500">Manage your income and expenses.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 shadow-lg"
        >
          + Add New
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex gap-2 bg-white p-2 rounded-lg border shadow-sm w-fit">
        {["ALL", "INCOME", "EXPENSE"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filter === type
                ? "bg-slate-100 text-slate-900 font-bold"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {type.charAt(0) + type.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* The List (Table) */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">
            Loading history...
          </div>
        ) : filteredData.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p>No transactions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium text-slate-500">
                    Category
                  </th>
                  <th className="px-6 py-4 font-medium text-slate-500">Date</th>
                  <th className="px-6 py-4 font-medium text-slate-500">
                    Amount
                  </th>
                  <th className="px-6 py-4 font-medium text-slate-500 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map((t) => (
                  <tr
                    key={t._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    {/* Category & Description */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            t.type === "INCOME"
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {t.type === "INCOME" ? (
                            <ArrowDownLeft size={18} />
                          ) : (
                            <ArrowUpRight size={18} />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {t.category}
                          </p>
                          <p className="text-xs text-slate-500">
                            {t.description || "No description"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-slate-500">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        {new Date(t.date).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </td>

                    {/* Amount */}
                    <td
                      className={`px-6 py-4 font-bold ${
                        t.type === "INCOME"
                          ? "text-emerald-600"
                          : "text-slate-900"
                      }`}
                    >
                      {t.type === "INCOME" ? "+" : "-"}{" "}
                      {formatCurrency(t.amount)}
                      {t.isLocked && (
                        <span className="ml-2 text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                          FIXED
                        </span>
                      )}
                      {t.isRecurring && (
                        <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded">
                          SUB
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(t._id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete Entry"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchTransactions} // Refresh list after add
      />
    </main>
  );
}
