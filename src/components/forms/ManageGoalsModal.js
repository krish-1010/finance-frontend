"use client";
import { useState, useEffect } from "react";
import { X, Trash2, Plus, Target, TrendingUp, ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

export default function ManageGoalsModal({ isOpen, onClose }) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("LIST"); // "LIST", "ADD", "DEPOSIT"

  // State for Adding Funds
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [depositAmount, setDepositAmount] = useState("");

  // State for Creating New Goal
  const [formData, setFormData] = useState({
    title: "",
    targetAmount: "",
    targetDate: "",
    savedAmount: 0,
  });

  useEffect(() => {
    if (isOpen) fetchGoals();
  }, [isOpen]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await api.get("/goals");
      setGoals(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this goal?")) return;
    try {
      await api.delete(`/goals/${id}`);
      fetchGoals();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/goals/${selectedGoal._id}/add`, {
        amount: depositAmount,
      });
      setDepositAmount("");
      setSelectedGoal(null);
      setView("LIST");
      fetchGoals(); // Refresh to see progress bar move!
    } catch (err) {
      alert("Failed to add funds");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/goals", formData);
      setFormData({
        title: "",
        targetAmount: "",
        targetDate: "",
        savedAmount: 0,
      });
      setView("LIST");
      fetchGoals();
    } catch (err) {
      alert(err.response?.data?.error || "Error adding goal");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-slate-50 shrink-0">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Target className="text-indigo-600" size={20} />
            {view === "LIST"
              ? "My Goals"
              : view === "ADD"
              ? "New Goal"
              : "Add Savings"}
          </h2>
          <button onClick={onClose}>
            <X size={20} className="text-slate-400 hover:text-red-500" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 overflow-y-auto">
          {/* --- VIEW 1: LIST GOALS --- */}
          {view === "LIST" && (
            <>
              {loading ? (
                <div className="text-center py-8 text-slate-400">
                  Loading...
                </div>
              ) : goals.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500 mb-4">No goals yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {goals.map((goal) => {
                    const percent = Math.min(
                      (goal.savedAmount / goal.targetAmount) * 100,
                      100
                    ).toFixed(0);
                    return (
                      <div
                        key={goal._id}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-100"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold text-slate-900">
                              {goal.title}
                            </h3>
                            <p className="text-xs text-slate-500">
                              {formatCurrency(goal.savedAmount)} of{" "}
                              {formatCurrency(goal.targetAmount)}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            {/* DEPOSIT BUTTON */}
                            <button
                              onClick={() => {
                                setSelectedGoal(goal);
                                setView("DEPOSIT");
                              }}
                              className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition"
                              title="Add Savings"
                            >
                              <Plus size={16} />
                            </button>
                            {/* DELETE BUTTON */}
                            <button
                              onClick={() => handleDelete(goal._id)}
                              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                        <div className="text-right text-[10px] text-slate-400 mt-1">
                          {percent}% Saved
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <button
                onClick={() => setView("ADD")}
                className="w-full mt-4 py-3 bg-slate-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800"
              >
                <Plus size={18} /> Create New Goal
              </button>
            </>
          )}

          {/* --- VIEW 2: DEPOSIT FUNDS --- */}
          {view === "DEPOSIT" && selectedGoal && (
            <form onSubmit={handleDeposit} className="space-y-4">
              <div className="text-center mb-6">
                <p className="text-slate-500 text-sm">Adding funds to</p>
                <h3 className="text-xl font-bold text-indigo-700">
                  {selectedGoal.title}
                </h3>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Amount Saved Today (₹)
                </label>
                <input
                  type="number"
                  required
                  autoFocus
                  className="w-full mt-1 p-4 text-2xl font-bold text-center border rounded-xl outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="500"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setView("LIST")}
                  className="flex-1 py-3 bg-slate-100 font-bold rounded-xl text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl flex justify-center gap-2"
                >
                  <TrendingUp size={20} /> Deposit
                </button>
              </div>
            </form>
          )}

          {/* --- VIEW 3: CREATE GOAL --- */}
          {view === "ADD" && (
            <form onSubmit={handleCreate} className="space-y-4">
              {/* Same form as before... */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Title
                </label>
                <input
                  required
                  className="w-full mt-1 p-3 border rounded-xl"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Target (₹)
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full mt-1 p-3 border rounded-xl"
                    value={formData.targetAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, targetAmount: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full mt-1 p-3 border rounded-xl"
                    value={formData.targetDate}
                    onChange={(e) =>
                      setFormData({ ...formData, targetDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setView("LIST")}
                  className="flex-1 py-3 bg-slate-100 font-bold rounded-xl text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl"
                >
                  Create Goal
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
