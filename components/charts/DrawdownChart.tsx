"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import type { NavPoint } from "@/lib/types";

export function DrawdownChart({ data, height = 200 }: { data: NavPoint[]; height?: number }) {
  let peak = -Infinity;
  const dd = data.map((p) => {
    peak = Math.max(peak, p.portfolio);
    return { date: p.date, drawdown: +(((p.portfolio / peak) - 1) * 100).toFixed(2) };
  });
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={dd} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="ddc" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#1d2330" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: "#8b95a7", fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: "#252c3a" }}
          tickFormatter={(v) => v.slice(0, 7)}
          minTickGap={28}
        />
        <YAxis
          tick={{ fill: "#8b95a7", fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: "#252c3a" }}
          width={42}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip
          contentStyle={{ background: "#11151c", border: "1px solid #252c3a", borderRadius: 6, fontSize: 12 }}
          formatter={(v: number) => `${v.toFixed(2)}%`}
        />
        <Area type="monotone" dataKey="drawdown" stroke="#ef4444" strokeWidth={1.5} fill="url(#ddc)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
