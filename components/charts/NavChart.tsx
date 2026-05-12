"use client";

import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import type { NavPoint } from "@/lib/types";

export function NavChart({ data, height = 300 }: { data: NavPoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="navP" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f5a623" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#f5a623" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="navB" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
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
          width={40}
          domain={["dataMin - 5", "dataMax + 5"]}
        />
        <Tooltip
          contentStyle={{ background: "#11151c", border: "1px solid #252c3a", borderRadius: 6, fontSize: 12 }}
          labelStyle={{ color: "#e6edf3" }}
          itemStyle={{ color: "#e6edf3" }}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: "#8b95a7" }} iconType="line" />
        <Area type="monotone" dataKey="portfolio" name="Cartera" stroke="#f5a623" strokeWidth={2} fill="url(#navP)" />
        <Area type="monotone" dataKey="benchmark" name="Benchmark" stroke="#3b82f6" strokeWidth={1.5} fill="url(#navB)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
