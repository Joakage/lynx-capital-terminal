"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell } from "recharts";
import type { MonthlyReturn } from "@/lib/types";

export function MonthlyBars({ data, height = 240 }: { data: MonthlyReturn[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#1d2330" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: "#8b95a7", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#252c3a" }} />
        <YAxis tick={{ fill: "#8b95a7", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#252c3a" }} width={36} tickFormatter={(v) => `${v}%`} />
        <Tooltip
          contentStyle={{ background: "#11151c", border: "1px solid #252c3a", borderRadius: 6, fontSize: 12 }}
          formatter={(v: number) => `${v.toFixed(2)}%`}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: "#8b95a7" }} iconType="square" />
        <Bar dataKey="portfolio" name="Cartera" radius={[2, 2, 0, 0]}>
          {data.map((d, i) => <Cell key={i} fill={d.portfolio >= 0 ? "#22c55e" : "#ef4444"} />)}
        </Bar>
        <Bar dataKey="benchmark" name="Benchmark" radius={[2, 2, 0, 0]} fill="#3b82f6" fillOpacity={0.6} />
      </BarChart>
    </ResponsiveContainer>
  );
}
