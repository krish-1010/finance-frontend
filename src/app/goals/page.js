"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Target, Pause, Play, CheckCircle2, Plus, History } from "lucide-react";
import ManageGoalsModal from "@/components/forms/ManageGoalsModal"; // Reuse your modal for creating

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [view, setView] = useState("ACTIVE"); // ACTIVE, PAUSED, COMPLETED
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchGoals = async () => {
    const res = await api.get("/goals");
    setGoals(res.data);
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const res = await api.get("/goals");
      if (mounted) setGoals(res.data);
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleToggleStatus = async (id) => {
    await api.put(`/goals/${id}/status`);
    fetchGoals();
  };

  // Filter goals based on current view tab
  const displayedGoals = goals.filter((g) => g.status === view);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Savings Goals</h1>
          <p className="text-slate-500">Track your sinking funds and big purchases.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex gap-2 items-center hover:bg-indigo-700"
        >
          <Plus size={18} /> New Goal
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        {["ACTIVE", "PAUSED", "COMPLETED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setView(tab)}
            className={`pb-2 text-sm font-bold ${
              view === tab 
              ? "text-indigo-600 border-b-2 border-indigo-600" 
              : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {displayedGoals.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-slate-400">
            No {view.toLowerCase()} goals found.
          </div>
        ) : (
          displayedGoals.map((goal) => {
            const percent = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100).toFixed(0);
            return (
              <div key={goal._id} className="bg-white p-5 rounded-xl border shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{goal.title}</h3>
                    <p className="text-sm text-slate-500">
                      {formatCurrency(goal.savedAmount)} / {formatCurrency(goal.targetAmount)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {/* Status Toggle Button */}
                    {goal.status !== "COMPLETED" && (
                      <button 
                        onClick={() => handleToggleStatus(goal._id)}
                        className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-600"
                        title={goal.status === "ACTIVE" ? "Pause Goal" : "Resume Goal"}
                      >
                        {goal.status === "ACTIVE" ? <Pause size={16} /> : <Play size={16} />}
                      </button>
                    )}
                    {/* Completed Icon */}
                    {goal.status === "COMPLETED" && <CheckCircle2 className="text-green-500" size={24} />}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-3 mb-2">
                  <div 
                    className={`h-3 rounded-full transition-all ${
                      goal.status === "COMPLETED" ? "bg-green-500" 
                      : goal.status === "PAUSED" ? "bg-amber-400" 
                      : "bg-indigo-600"
                    }`}
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{percent}% Funded</span>
                  {goal.deadline && <span>Due: {new Date(goal.deadline).toLocaleDateString()}</span>}
                </div>
              </div>
            );
          })
        )}
      </div>

      <ManageGoalsModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); fetchGoals(); }} 
      />
    </div>
  );
}