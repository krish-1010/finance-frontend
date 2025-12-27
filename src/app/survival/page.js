"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Trash2, Plus, Zap } from "lucide-react";

export default function SurvivalPage() {
  const [items, setItems] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0); // This could come from store/api
  const [newItem, setNewItem] = useState({ name: "", cost: "", months: "" });

  const fetchItems = () => {
    api.get("/survival").then((res) => setItems(res.data));
  };

  useEffect(() => {
    fetchItems();
    // Fetch wallet balance from dashboard or use local state
    api
      .get("/dashboard")
      .then((res) => setWalletBalance(res.data.summary.balance));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.cost) return;
    await api.post("/survival", newItem);
    setNewItem({ name: "", cost: "", months: "" });
    fetchItems();
  };

  const handleDelete = async (id) => {
    await api.delete(`/survival/${id}`);
    fetchItems();
  };

  // Core Math (The Old App Logic)
  const totalMonthlyBurn = items.reduce(
    (acc, item) => acc + (item.monthlyCost || 0),
    0
  );
  const runway =
    totalMonthlyBurn > 0 ? (walletBalance / totalMonthlyBurn).toFixed(1) : "∞";

  return (
    <main className="p-4 md:p-8 space-y-6 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
        <Zap className="text-amber-500" /> Survival Calculator
      </h1>
      <p className="text-slate-500">
        Amortization & True Cost of Living (Old App Style)
      </p>

      {/* 1. The Head-Up Display (HUD) */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-slate-900 p-6 rounded-xl text-white">
          <label className="text-xs text-slate-400 uppercase font-bold">
            Wallet Balance
          </label>
          <div className="text-3xl font-bold mt-1">
            {formatCurrency(walletBalance)}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Auto-fetched from Dashboard
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <label className="text-xs text-slate-400 uppercase font-bold">
            True Monthly Burn
          </label>
          <div className="text-3xl font-bold mt-1 text-slate-900">
            {formatCurrency(totalMonthlyBurn)}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Cost of all items / month
          </p>
        </div>
        <div
          className={`p-6 rounded-xl border shadow-sm ${
            runway < 3
              ? "bg-red-50 border-red-200"
              : "bg-emerald-50 border-emerald-200"
          }`}
        >
          <label
            className={`text-xs uppercase font-bold ${
              runway < 3 ? "text-red-600" : "text-emerald-600"
            }`}
          >
            Runway
          </label>
          <div
            className={`text-3xl font-bold mt-1 ${
              runway < 3 ? "text-red-700" : "text-emerald-700"
            }`}
          >
            {runway} Months
          </div>
          <p className="text-xs opacity-70 mt-2">Time until money runs out</p>
        </div>
      </div>

      {/* 2. Add Item Form */}
      <form
        onSubmit={handleAdd}
        className="bg-white p-4 rounded-xl shadow-sm border flex flex-col md:flex-row gap-4 items-end"
      >
        <div className="flex-1 w-full">
          <label className="text-xs font-bold text-slate-500">Item Name</label>
          <input
            className="w-full border p-2 rounded-lg mt-1"
            placeholder="e.g. Pen, Notebook, Printer Ink"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          />
        </div>
        <div className="w-32">
          <label className="text-xs font-bold text-slate-500">Cost (₹)</label>
          <input
            type="number"
            className="w-full border p-2 rounded-lg mt-1"
            placeholder="100"
            value={newItem.cost}
            onChange={(e) => setNewItem({ ...newItem, cost: e.target.value })}
          />
        </div>
        <div className="w-32">
          <label className="text-xs font-bold text-slate-500">
            Lasts (Months)
          </label>
          <input
            type="number"
            className="w-full border p-2 rounded-lg mt-1"
            placeholder="4"
            value={newItem.months}
            onChange={(e) => setNewItem({ ...newItem, months: e.target.value })}
          />
        </div>
        <button className="bg-slate-900 text-white p-2.5 rounded-lg hover:bg-slate-800">
          <Plus />
        </button>
      </form>

      {/* 3. The List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 font-medium text-slate-500">Item</th>
              <th className="p-4 font-medium text-slate-500">Full Cost</th>
              <th className="p-4 font-medium text-slate-500">Duration</th>
              <th className="p-4 font-medium text-slate-900">
                True Monthly Cost
              </th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item) => (
              <tr key={item._id} className="hover:bg-slate-50">
                <td className="p-4 font-bold text-slate-700">{item.name}</td>
                <td className="p-4 text-slate-500">
                  {formatCurrency(item.cost)}
                </td>
                <td className="p-4 text-slate-500">{item.months} Months</td>
                <td className="p-4 font-mono font-bold text-indigo-600 bg-indigo-50 w-fit rounded">
                  {formatCurrency(item.monthlyCost)}/mo
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            No items added yet. Add bulk purchases here.
          </div>
        )}
      </div>
    </main>
  );
}
