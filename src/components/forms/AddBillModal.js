"use client";
import { useState } from "react";
import { X, CalendarClock, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";

export default function AddBillModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    dueDay: "",
    category: "Bills",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/bills", formData); // Ensure this route exists in backend
      onSuccess(); // Refresh the list
      onClose();
      setFormData({ name: "", amount: "", dueDay: "", category: "Bills" });
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add bill");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <CalendarClock className="text-indigo-600" size={20} /> Recurring
            Bill
          </h2>
          <button onClick={onClose}>
            <X size={20} className="text-slate-400 hover:text-red-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase">
              Bill Name
            </label>
            <input
              required
              placeholder="e.g. Home Rent, Netflix, Salary"
              className="w-full mt-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">
                Amount (₹)
              </label>
              <input
                type="number"
                required
                placeholder="10000"
                className="w-full mt-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">
                Due Day
              </label>
              <input
                type="number"
                required
                placeholder="5"
                min="1"
                max="31"
                className="w-full mt-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.dueDay}
                onChange={(e) =>
                  setFormData({ ...formData, dueDay: e.target.value })
                }
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg flex justify-center gap-2 transition-all"
          >
            {loading ? (
              "Saving..."
            ) : (
              <>
                <CheckCircle2 /> Save Template
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
