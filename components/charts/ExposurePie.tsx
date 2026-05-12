"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { CHART_COLORS } from "@/lib/utils";

export function ExposurePie({
  data,
  height = 220,
  labelKey,
  valueKey = "weight",
}: {
  data: Array<Record<string, unknown>>;
  height?: number;
  labelKey: string;
  valueKey?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey={valueKey}
          nameKey={labelKey}
          cx="50%"
          cy="50%"
          innerRadius={45}
          outerRadius={80}
          paddingAngle={2}
          stroke="none"
        >
          {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
        </Pie>
        <Tooltip
          contentStyle={{ background: "#11151c", border: "1px solid #252c3a", borderRadius: 6, fontSize: 12 }}
          formatter={(v: number) => `${v.toFixed(1)}%`}
        />
        <Legend wrapperStyle={{ fontSize: 11, color: "#8b95a7" }} iconType="square" />
      </PieChart>
    </ResponsiveContainer>
  );
}
