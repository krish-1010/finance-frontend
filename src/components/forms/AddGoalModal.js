"use client";
import { useState } from "react";
import { X, Target, CheckCircle2 } from "lucide-react"; // Changed Icon to Target
import api from "@/lib/api";

export default function AddGoalModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "", // Was "name"
    targetAmount: "", // Was "amount"
    targetDate: "", // Was "dueDay" (Now a real date)
    savedAmount: 0, // Allow setting initial savings (optional)
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/goals", formData);
      onSuccess();
      onClose();
      setFormData({
        title: "",
        targetAmount: "",
        targetDate: "",
        savedAmount: 0,
      });
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add goal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Target className="text-indigo-600" size={20} /> New Goal
          </h2>
          <button onClick={onClose}>
            <X size={20} className="text-slate-400 hover:text-red-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase">
              Goal Title
            </label>
            <input
              required
              placeholder="e.g. Gaming PC, Emergency Fund"
              className="w-full mt-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          {/* Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">
                Target Amount (₹)
              </label>
              <input
                type="number"
                required
                placeholder="100000"
                className="w-full mt-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                value={formData.targetAmount}
                onChange={(e) =>
                  setFormData({ ...formData, targetAmount: e.target.value })
                }
              />
            </div>
            {/* DATE PICKER (Not just a number) */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">
                Deadline
              </label>
              <input
                type="date"
                required
                className="w-full mt-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.targetDate}
                onChange={(e) =>
                  setFormData({ ...formData, targetDate: e.target.value })
                }
              />
            </div>
          </div>

          {/* Initial Savings (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase">
              Already Saved? (Optional)
            </label>
            <input
              type="number"
              placeholder="0"
              className="w-full mt-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              value={formData.savedAmount}
              onChange={(e) =>
                setFormData({ ...formData, savedAmount: e.target.value })
              }
            />
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
                <CheckCircle2 /> Create Goal
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
