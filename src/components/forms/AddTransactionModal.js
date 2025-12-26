"use client";

import { useState } from "react";
import { X, Lock, RefreshCw, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

export default function AddTransactionModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("EXPENSE"); // 'INCOME' or 'EXPENSE'

  // Form State
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0], // Today
    isLocked: false, // "Essential/Fixed"
    isRecurring: false, // "Subscription"
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/transactions", { ...formData, type });
      onSuccess(); // Refresh dashboard data
      onClose(); // Close modal
      // Reset form
      setFormData({
        amount: "",
        category: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        isLocked: false,
        isRecurring: false,
      });
    } catch (err) {
      alert("Failed to save: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Add New Entry</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded-full text-slate-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Type Toggle (The "Modern Twist") */}
        <div className="flex p-2 m-4 bg-slate-100 rounded-lg">
          {["EXPENSE", "INCOME"].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={cn(
                "flex-1 py-2 text-sm font-semibold rounded-md transition-all",
                type === t
                  ? t === "EXPENSE"
                    ? "bg-red-500 text-white shadow"
                    : "bg-emerald-500 text-white shadow"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {t === "EXPENSE" ? "Expense (Out)" : "Income (In)"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase">
              Amount
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-2.5 text-slate-400 font-bold">
                ₹
              </span>
              <input
                type="number"
                required
                className="w-full pl-8 pr-4 py-2 text-lg font-bold border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
              />
            </div>
          </div>

          {/* Description & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase">
                Category
              </label>
              <input
                type="text"
                required
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-sm"
                placeholder={
                  type === "INCOME" ? "Salary, Freelance" : "Food, Rent"
                }
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase">
                Date
              </label>
              <input
                type="date"
                required
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-sm"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>
          </div>

          {/* The "Brainstormed" Toggles - Only show for Expenses */}
          {type === "EXPENSE" && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              {/* Toggle: Locked/Fixed */}
              <div
                onClick={() =>
                  setFormData((prev) => ({ ...prev, isLocked: !prev.isLocked }))
                }
                className={cn(
                  "cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all",
                  formData.isLocked
                    ? "bg-slate-900 border-slate-900 text-white"
                    : "border-slate-200 text-slate-500 hover:border-slate-300"
                )}
              >
                <Lock size={18} />
                <span className="text-xs font-medium">Fixed / Essential</span>
              </div>

              {/* Toggle: Recurring */}
              <div
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    isRecurring: !prev.isRecurring,
                  }))
                }
                className={cn(
                  "cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all",
                  formData.isRecurring
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "border-slate-200 text-slate-500 hover:border-slate-300"
                )}
              >
                <RefreshCw size={18} />
                <span className="text-xs font-medium">Subscription</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex justify-center items-center gap-2"
          >
            {loading ? (
              "Saving..."
            ) : (
              <>
                <CheckCircle2 size={18} /> Save Entry
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
