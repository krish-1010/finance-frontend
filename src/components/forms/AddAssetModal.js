"use client";

import { useState } from "react";
import { X, CheckCircle2, Building2, Coins, Banknote } from "lucide-react";
import api from "@/lib/api";

export default function AddAssetModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "CASH", // Default
    value: "",
    isLiquid: true,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/assets", formData);
      onSuccess();
      onClose();
      setFormData({ name: "", type: "CASH", value: "", isLiquid: true });
    } catch (err) {
      alert("Failed to add asset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-4 border-b bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Add Asset</h2>
          <button onClick={onClose}>
            <X size={20} className="text-slate-400 hover:text-red-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase">
              Asset Name
            </label>
            <input
              required
              placeholder="e.g. HDFC Savings, Zerodha, Gold Chain"
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
                Current Value
              </label>
              <input
                type="number"
                required
                placeholder="₹ 1,00,000"
                className="w-full mt-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-slate-900 font-bold"
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">
                Type
              </label>
              <select
                className="w-full mt-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <option value="CASH">Cash / Bank</option>
                <option value="INVESTMENT">Stock / MF</option>
                <option value="GOLD">Gold</option>
                <option value="REAL_ESTATE">Real Estate</option>
                <option value="EPF">EPF / PPF</option>
              </select>
            </div>
          </div>

          {/* Liquid Toggle */}
          <div
            onClick={() =>
              setFormData((prev) => ({ ...prev, isLiquid: !prev.isLiquid }))
            }
            className={`cursor-pointer border p-3 rounded-xl flex items-center justify-between transition-all ${
              formData.isLiquid
                ? "bg-emerald-50 border-emerald-500"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-full ${
                  formData.isLiquid
                    ? "bg-emerald-200 text-emerald-800"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                <Banknote size={18} />
              </div>
              <div>
                <p
                  className={`text-sm font-bold ${
                    formData.isLiquid ? "text-emerald-900" : "text-slate-500"
                  }`}
                >
                  Liquid Asset
                </p>
                <p className="text-xs text-slate-400">
                  Can be sold instantly for emergencies?
                </p>
              </div>
            </div>
            {formData.isLiquid && (
              <CheckCircle2 className="text-emerald-600" size={20} />
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg flex justify-center gap-2"
          >
            {loading ? "Saving..." : "Add to Net Worth"}
          </button>
        </form>
      </div>
    </div>
  );
}
