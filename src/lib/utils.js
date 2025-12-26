import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind Class Merger
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Currency Formatter (₹ 1,50,000)
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};
