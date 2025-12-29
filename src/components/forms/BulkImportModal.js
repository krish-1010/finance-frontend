"use client";
import { useState } from "react";
import {
  X,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import api from "@/lib/api";

export default function BulkImportModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [report, setReport] = useState(null); // Stores success/error count
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setError("");
      setReport(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file); // Must match backend 'upload.single("file")'

    try {
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setReport(res.data.report);
      if (onSuccess) onSuccess(); // Refresh parent page
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Upload failed. Check console.");
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent =
      "data:text/csv;charset=utf-8,date,description,amount,type,category\n2025-01-01,Salary,50000,INCOME,Salary\n2025-01-02,Uber,250,EXPENSE,Travel";
    const encodedUri = encodeURI(csvContent);
    window.open(encodedUri);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <UploadCloud className="text-indigo-600" size={20} /> Import CSV
          </h2>
          <button onClick={onClose}>
            <X size={20} className="text-slate-400 hover:text-red-500" />
          </button>
        </div>

        <div className="p-6">
          {!report ? (
            /* --- STATE 1: UPLOAD FORM --- */
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                <FileText className="text-slate-400 mb-3" size={40} />
                <p className="text-sm text-slate-600 mb-2 font-medium">
                  {file ? file.name : "Click to select CSV file"}
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csvInput"
                />
                <label
                  htmlFor="csvInput"
                  className="cursor-pointer text-xs text-indigo-600 font-bold hover:underline"
                >
                  Browse Files
                </label>
              </div>

              {/* Template Download */}
              <div className="text-center">
                <button
                  onClick={downloadTemplate}
                  className="text-xs text-slate-400 hover:text-slate-600 hover:underline"
                >
                  Download Sample Template
                </button>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg flex gap-2 items-start">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl disabled:opacity-50 transition-all flex justify-center gap-2"
              >
                {uploading ? "Processing..." : <>Upload & Process</>}
              </button>
            </div>
          ) : (
            /* --- STATE 2: SUCCESS REPORT --- */
            <div className="text-center space-y-6">
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="text-green-600" size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Import Complete!
                </h3>
                <p className="text-slate-500 text-sm mt-1">
                  Your data has been processed.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <p className="text-2xl font-bold text-green-700">
                    {report.successCount}
                  </p>
                  <p className="text-xs text-green-600 font-medium uppercase">
                    Imported
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-2xl font-bold text-red-700">
                    {report.errorCount}
                  </p>
                  <p className="text-xs text-red-600 font-medium uppercase">
                    Skipped
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
