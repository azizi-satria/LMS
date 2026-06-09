"use client";

import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface ProgressPieChartProps {
  progress: number;
  totalCourses: number;
  completedMaterials: number;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
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
        <p style={{ color: "#a855f7", fontWeight: 600 }}>{payload[0].value}% selesai</p>
      </div>
    );
  }
  return null;
}

export default function ProgressPieChart({ progress, totalCourses, completedMaterials }: ProgressPieChartProps) {
  const data = [
    { name: "Progress", value: progress, fill: "url(#progressGrad)" },
    { name: "Sisa", value: 100 - progress, fill: "rgba(255,255,255,0.05)" },
  ];

  return (
    <div className="flex items-center gap-6">
      <div style={{ width: 140, height: 140 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={65}
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <defs>
              <linearGradient id="progressGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <RadialBar dataKey="value" cornerRadius={8} />
            <Tooltip content={<CustomTooltip />} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-3xl font-bold" style={{ background: "linear-gradient(135deg, #a855f7, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {progress}%
          </p>
          <p className="text-sm" style={{ color: "#64748b" }}>Progress Keseluruhan</p>
        </div>
        <div className="flex gap-4 text-sm">
          <div>
            <p className="font-semibold" style={{ color: "#f1f5f9" }}>{totalCourses}</p>
            <p style={{ color: "#64748b" }}>Kursus</p>
          </div>
          <div>
            <p className="font-semibold" style={{ color: "#f1f5f9" }}>{completedMaterials}</p>
            <p style={{ color: "#64748b" }}>Materi Selesai</p>
          </div>
        </div>
      </div>
    </div>
  );
}
