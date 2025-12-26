"use client";
import { useState } from "react";
import { Trash2, X, AlertTriangle } from "lucide-react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function SettingsModal({ isOpen, onClose }) {
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const handleReset = async () => {
    if (confirmText !== "DELETE MY DATA") return;

    setLoading(true);
    try {
      await api.delete("/reset");
      alert("Account reset complete.");
      window.location.reload(); // Refresh to clear UI
    } catch (err) {
      alert("Failed to reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-white">
        <div className="p-4 border-b border-slate-800 flex justify-between">
          <h2 className="font-bold text-lg">Account Settings</h2>
          <button onClick={onClose}>
            <X className="text-slate-400 hover:text-white" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-red-900/20 border border-red-900 p-4 rounded-xl flex gap-3">
            <AlertTriangle className="text-red-500 shrink-0" />
            <div>
              <h3 className="font-bold text-red-500">Danger Zone</h3>
              <p className="text-xs text-red-200/70 mt-1">
                This will permanently delete all your transactions, debts, and
                assets. This cannot be undone.
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400">
              Type{" "}
              <span className="font-mono font-bold text-white">
                DELETE MY DATA
              </span>{" "}
              to confirm
            </label>
            <input
              className="w-full bg-black border border-slate-700 p-3 rounded-lg mt-2 text-center font-mono tracking-widest uppercase focus:border-red-500 outline-none transition-colors"
              placeholder="DELETE MY DATA"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
          </div>

          <button
            onClick={handleReset}
            disabled={confirmText !== "DELETE MY DATA" || loading}
            className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold flex justify-center items-center gap-2"
          >
            {loading ? (
              "Deleting..."
            ) : (
              <>
                <Trash2 size={18} /> Wipe Everything
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
