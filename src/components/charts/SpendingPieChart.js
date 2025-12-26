"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// Modern Color Palette for Categories
const COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#64748b",
];

export default function SpendingPieChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/analytics")
      .then((res) => {
        // Transform API data ({_id: "Food", total: 500}) -> Recharts format
        const formatted = res.data.map((item) => ({
          name: item._id,
          value: item.total,
        }));
        setData(formatted);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-300" />
      </div>
    );

  if (data.length === 0)
    return (
      <div className="h-full flex items-center justify-center text-slate-400 text-sm">
        No expense data yet
      </div>
    );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60} // Donut style
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
              strokeWidth={0}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => formatCurrency(value)}
          contentStyle={{
            backgroundColor: "#fff",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            fontSize: "12px",
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          wrapperStyle={{ fontSize: "12px" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
