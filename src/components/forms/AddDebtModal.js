"use client";

import { useState } from "react";
import { X, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";

export default function AddDebtModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    totalAmount: "",
    currentAmount: "",
    interestRate: "",
    minimumPayment: "",
    dueDate: "", // Day of month (e.g., 5)
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/debts", formData);
      onSuccess();
      onClose();
      setFormData({
        name: "",
        totalAmount: "",
        currentAmount: "",
        interestRate: "",
        minimumPayment: "",
        dueDate: "",
      });
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add debt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-4 border-b bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Add Liability</h2>
          <button onClick={onClose}>
            <X size={20} className="text-slate-400 hover:text-red-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase">
              Debt Name
            </label>
            <input
              required
              placeholder="e.g. HDFC Credit Card"
              className="w-full mt-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-slate-900"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">
                Current Balance
              </label>
              <input
                type="number"
                required
                placeholder="₹ 50,000"
                className="w-full mt-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-slate-900 font-bold"
                value={formData.currentAmount}
                onChange={(e) =>
                  setFormData({ ...formData, currentAmount: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">
                Interest Rate (%)
              </label>
              <input
                type="number"
                required
                placeholder="12%"
                step="0.1"
                className="w-full mt-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-slate-900"
                value={formData.interestRate}
                onChange={(e) =>
                  setFormData({ ...formData, interestRate: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">
                Min Payment
              </label>
              <input
                type="number"
                required
                placeholder="₹ 2,000"
                className="w-full mt-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-slate-900"
                value={formData.minimumPayment}
                onChange={(e) =>
                  setFormData({ ...formData, minimumPayment: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">
                Due Day
              </label>
              <input
                type="number"
                placeholder="5th"
                max="31"
                className="w-full mt-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-slate-900"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
              />
            </div>
          </div>

          {/* Hidden field for Total Original Amount (Optional, can just mirror current for now) */}
          <input type="hidden" value={formData.currentAmount} />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg flex justify-center gap-2"
          >
            {loading ? (
              "Saving..."
            ) : (
              <>
                <CheckCircle2 /> Add Debt
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
