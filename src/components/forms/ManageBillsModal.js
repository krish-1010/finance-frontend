"use client";
import { useState, useEffect } from "react";
import { X, Trash2, Plus, CalendarClock } from "lucide-react";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils"; // Assuming you have this

export default function ManageBillsModal({ isOpen, onClose }) {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("LIST"); // "LIST" or "ADD"

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    dueDay: "",
    category: "Bills",
  });

  // Fetch Bills when modal opens
  useEffect(() => {
    if (isOpen) fetchBills();
  }, [isOpen]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const res = await api.get("/bills");
      setBills(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Stop tracking this bill?")) return;
    try {
      await api.delete(`/bills/${id}`);
      fetchBills(); // Refresh list
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post("/bills", formData);
      setFormData({ name: "", amount: "", dueDay: "", category: "Bills" });
      setView("LIST"); // Go back to list
      fetchBills(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.error || "Error adding bill");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-slate-50 shrink-0">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <CalendarClock className="text-indigo-600" size={20} />
            {view === "LIST" ? "Recurring Bills" : "Add New Bill"}
          </h2>
          <button onClick={onClose}>
            <X size={20} className="text-slate-400 hover:text-red-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto">
          {view === "LIST" ? (
            <>
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : bills.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  No recurring bills set up.
                </div>
              ) : (
                <div className="space-y-3">
                  {bills.map((bill) => (
                    <div
                      key={bill._id}
                      className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{bill.name}</p>
                        <p className="text-xs text-slate-500">
                          Due day: {bill.dueDay} • {formatCurrency(bill.amount)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(bill._id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setView("ADD")}
                className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Add New Bill
              </button>
            </>
          ) : (
            /* ADD FORM */
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Bill Name
                </label>
                <input
                  required
                  className="w-full mt-1 p-3 border rounded-xl"
                  placeholder="Netflix, Rent, etc."
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Amount
                  </label>
                  <input
                    required
                    type="number"
                    className="w-full mt-1 p-3 border rounded-xl"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Due Day (1-31)
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="31"
                    className="w-full mt-1 p-3 border rounded-xl"
                    value={formData.dueDay}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDay: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setView("LIST")}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl"
                >
                  Save Bill
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
