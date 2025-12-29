"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import AddTransactionModal from "@/components/forms/AddTransactionModal";
import BulkImportModal from "@/components/forms/BulkImportModal";
import { Upload } from "lucide-react"; // Import Icon

export default function TransactionsPage() {
  // Data State
  const [transactions, setTransactions] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filter State
  const [filterType, setFilterType] = useState("ALL"); // ALL, INCOME, EXPENSE
  const [filterMonth, setFilterMonth] = useState(""); // "" or "2025-08"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Fetch Logic
  const fetchTransactions = async (page = 1) => {
    setLoading(true);
    try {
      // Build Query String
      const params = new URLSearchParams({
        page,
        limit: 15, // Items per page
        type: filterType,
      });

      if (filterMonth) params.append("month", filterMonth);

      const res = await api.get(`/transactions?${params.toString()}`);
      setTransactions(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when filters change
  useEffect(() => {
    fetchTransactions(1); // Reset to page 1 on filter change
  }, [filterType, filterMonth]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= meta.totalPages) {
      fetchTransactions(newPage);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    try {
      await api.delete(`/transactions/${id}`);
      fetchTransactions(meta.page); // Refresh current page
    } catch (err) {
      alert("Failed to delete");
    }
  };

  return (
    <main className="p-4 md:p-8 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Transactions
          </h1>
          <p className="text-slate-500">Manage your income and expenses.</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm flex items-center gap-2"
          >
            <Upload size={16} /> Import CSV
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 shadow-lg flex items-center gap-2"
          >
            + Add New
          </button>
        </div>
      </div>

      {/* --- FILTERS BAR --- */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-3 rounded-xl border shadow-sm items-center">
        {/* Type Filter */}
        <div className="flex bg-slate-100 p-1 rounded-lg">
          {["ALL", "INCOME", "EXPENSE"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                filterType === type
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Month Filter */}
        <div className="flex items-center gap-2 border-l pl-4 md:border-l-0 md:pl-0">
          <Calendar size={16} className="text-slate-400" />
          <input
            type="month"
            className="text-sm bg-transparent outline-none text-slate-600 font-medium cursor-pointer"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          />
          {filterMonth && (
            <button
              onClick={() => setFilterMonth("")}
              className="text-[10px] text-red-500 hover:underline ml-2"
            >
              Clear
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="ml-auto text-xs text-slate-400">
          Showing {transactions.length} of {meta.total} results
        </div>
      </div>

      {/* --- TABLE LIST --- */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
            <div className="animate-spin h-6 w-6 border-2 border-slate-300 border-t-indigo-600 rounded-full"></div>
            Loading...
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Filter className="mx-auto h-10 w-10 mb-2 opacity-20" />
            <p>No transactions found.</p>
            <p className="text-xs mt-1">Try adjusting your filters.</p>
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
                {transactions.map((t) => (
                  <tr
                    key={t._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
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
                          <p className="text-xs text-slate-500 truncate max-w-[200px]">
                            {t.description || "No description"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      {new Date(t.date).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td
                      className={`px-6 py-4 font-bold whitespace-nowrap ${
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
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(t._id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
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

      {/* --- PAGINATION CONTROLS --- */}
      {meta.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-4">
          <button
            onClick={() => handlePageChange(meta.page - 1)}
            disabled={meta.page === 1}
            className="p-2 rounded-lg border bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600"
          >
            <ChevronLeft size={20} />
          </button>

          <span className="text-sm font-medium text-slate-600">
            Page {meta.page} of {meta.totalPages}
          </span>

          <button
            onClick={() => handlePageChange(meta.page + 1)}
            disabled={meta.page === meta.totalPages}
            className="p-2 rounded-lg border bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchTransactions(1)}
      />

      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => fetchTransactions(1)} // Refresh list after import
      />
    </main>
  );
}
