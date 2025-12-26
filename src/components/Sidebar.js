"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  PiggyBank,
  TrendingUp,
  LogOut,
  Menu,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transactions", href: "/transactions", icon: Wallet },
  { name: "Debt Manager", href: "/debts", icon: TrendingUp },
  { name: "Wealth & FIRE", href: "/goals", icon: PiggyBank },
  { name: "Advisor", href: "/advisor", icon: GraduationCap }, // Added this
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false); // Mobile toggle state

  // LOGOUT FUNCTION
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout"); // Call Backend
      router.push("/login"); // Redirect to Login Page
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-slate-900 text-white rounded-md shadow-lg"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar Container */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800">
            <h1 className="text-xl font-bold bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Finance GPS
            </h1>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-emerald-600 text-white shadow-md"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <Icon size={20} className="mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile / Logout */}
          <div className="p-4 border-t border-slate-800">
            <button
              onClick={handleLogout} // Attach the function here
              className="flex items-center w-full px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut size={20} className="mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile when menu is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
