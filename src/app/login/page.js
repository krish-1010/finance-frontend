"use client";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-slate-100 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
            <ShieldCheck size={32} />
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
          <p className="mt-2 text-slate-500">
            Sign in to access your financial dashboard.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {/* This link hits your Backend API directly */}
          <Link
            href={`${API_URL}/auth/google`}
            className="flex items-center justify-center w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm bg-white text-slate-700 font-medium hover:bg-slate-50 transition-colors gap-3"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              className="h-5 w-5"
              alt="Google Logo"
            />
            Sign in with Google
          </Link>

          <p className="text-xs text-slate-400 mt-4">
            By signing in, you agree to our Terms and Privacy Policy. We do not
            share your financial data.
          </p>
        </div>
      </div>
    </div>
  );
}
