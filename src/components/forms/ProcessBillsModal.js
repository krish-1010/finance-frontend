"use client";
import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, Plus } from "lucide-react";
import api from "@/lib/api";

export default function ProcessBillsModal({ isOpen, onClose }) {
  const [bills, setBills] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load bills when modal opens
  useEffect(() => {
    if (isOpen) {
      api.get("/bills").then((res) => {
        setBills(res.data);
        // Optional: Select all by default
        // setSelected(res.data);
      });
    }
  }, [isOpen]);

  const handleProcess = async () => {
    if (selected.length === 0) return;
    setLoading(true);
    try {
      await api.post("/transactions/bulk", { bills: selected });
      alert(`✅ Added ${selected.length} bills to your ledger!`);
      onClose();
      window.location.reload(); // Refresh to see new transactions
    } catch (err) {
      alert("Failed to process bills");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (bill) => {
    if (selected.find((b) => b._id === bill._id)) {
      setSelected(selected.filter((b) => b._id !== bill._id));
    } else {
      setSelected([...selected, bill]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
          <h2 className="font-bold text-lg text-slate-800">
            Process Recurring Bills
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
          {bills.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p>No recurring bills set up.</p>
              <p className="text-xs mt-1">
                Add them in Settings or Transactions page.
              </p>
            </div>
          ) : (
            bills.map((bill) => {
              const isSelected = selected.find((b) => b._id === bill._id);
              return (
                <div
                  key={bill._id}
                  onClick={() => toggleSelection(bill)}
                  className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-blue-300"
                  }`}
                >
                  <div
                    className={`h-5 w-5 rounded border flex items-center justify-center ${
                      isSelected
                        ? "bg-blue-500 border-blue-500"
                        : "border-slate-300"
                    }`}
                  >
                    {isSelected && (
                      <CheckCircle2 size={14} className="text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-800">{bill.name}</div>
                    <div className="text-xs text-slate-500">
                      Due on {bill.dueDay}th
                    </div>
                  </div>
                  <div className="font-mono font-bold text-slate-700">
                    ₹{bill.amount.toLocaleString()}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t bg-slate-50">
          <button
            onClick={handleProcess}
            disabled={loading || selected.length === 0}
            className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50 flex justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              `Add ${selected.length} to Ledger`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
