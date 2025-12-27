// src/components/charts/RunwayGauge.js
"use client";
import { ResponsiveContainer, PieChart, Pie, Cell, Label } from "recharts";

export default function RunwayGauge({ months }) {
  // Cap the visual at 12 months for the gauge
  const value = Math.min(parseFloat(months) || 0, 12);
  const data = [
    { name: "Runway", value: value },
    { name: "Empty", value: 12 - value },
  ];

  // Color logic: <3 months is danger (red), >6 is safe (green)
  const color = value < 3 ? "#ef4444" : value < 6 ? "#f59e0b" : "#10b981";

  return (
    <div className="h-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="70%" // Move half-circle down
            startAngle={180}
            endAngle={0}
            innerRadius="70%"
            outerRadius="100%"
            dataKey="value"
            stroke="none"
          >
            <Cell fill={color} />
            <Cell fill="#e2e8f0" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute bottom-0 left-0 right-0 text-center pb-2">
        <div className="text-3xl font-bold text-slate-800">{months}</div>
        <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">
          Months
        </div>
      </div>
    </div>
  );
}
