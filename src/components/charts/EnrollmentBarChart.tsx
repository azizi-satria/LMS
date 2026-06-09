"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DataItem {
  name: string;
  enrollments: number;
}

interface EnrollmentBarChartProps {
  data: DataItem[];
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "rgba(17,17,24,0.95)",
          border: "1px solid rgba(124,58,237,0.3)",
          borderRadius: "12px",
          padding: "10px 14px",
          color: "#f1f5f9",
          fontSize: "13px",
        }}
      >
        <p style={{ color: "#94a3b8", marginBottom: "4px" }}>{label}</p>
        <p style={{ color: "#a855f7", fontWeight: 600 }}>{payload[0].value} mahasiswa</p>
      </div>
    );
  }
  return null;
}

export default function EnrollmentBarChart({ data }: EnrollmentBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: "#64748b", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval={0}
          angle={-15}
          textAnchor="end"
          height={40}
        />
        <YAxis
          tick={{ fill: "#64748b", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(124,58,237,0.08)" }} />
        <Bar dataKey="enrollments" fill="url(#enrollGrad)" radius={[6, 6, 0, 0]} />
        <defs>
          <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a855f7" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.5} />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
}
