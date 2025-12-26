import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Finance GPS",
  description: "Wealth planning for the modern Indian.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}
      >
        <div className="flex min-h-screen">
          <Sidebar /> {/* The Navigation */}
          <div className="flex-1 md:ml-64 transition-all duration-200">
            {children} {/* The Page Content */}
          </div>
        </div>
      </body>
    </html>
  );
}
