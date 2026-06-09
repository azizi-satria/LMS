import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const visStyles: Record<string, { bg: string; color: string; border: string; label: string }> = {
  DRAFT: { bg: "rgba(100,116,139,0.12)", color: "#94a3b8", border: "rgba(100,116,139,0.25)", label: "Draft" },
  INTERNAL: { bg: "rgba(245,158,11,0.12)", color: "#fbbf24", border: "rgba(245,158,11,0.25)", label: "Internal" },
  PUBLIC: { bg: "rgba(34,197,94,0.12)", color: "#22c55e", border: "rgba(34,197,94,0.25)", label: "Publik" },
};

export default async function AdminCoursesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dashboard");

  const courses = await prisma.course.findMany({
    include: {
      instructor: { select: { name: true, email: true } },
      _count: { select: { enrollments: true, modules: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#f1f5f9" }}>Semua Kursus</h1>
          <p className="mt-1" style={{ color: "#64748b" }}>Total {courses.length} kursus di platform</p>
        </div>
        <div className="flex items-center gap-2 text-sm flex-wrap">
          {["DRAFT", "INTERNAL", "PUBLIC"].map((v) => {
            const count = courses.filter((c) => c.visibility === v).length;
            const s = visStyles[v];
            return (
              <span key={v} className="px-3 py-1.5 rounded-lg font-medium" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                {count} {s.label}
              </span>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #1e1e2e" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid #1e1e2e" }}>
                {["Kursus", "Dosen", "Semester", "Visibilitas", "Harga", "Statistik", "Dibuat"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#64748b" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {courses.map((course, idx) => {
                const vs = visStyles[course.visibility];
                return (
                  <tr key={course.id} className="transition-all" style={{ borderTop: "1px solid rgba(255,255,255,0.04)", background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                    <td className="px-6 py-4">
                      <p className="font-medium" style={{ color: "#f1f5f9" }}>{course.title}</p>
                      <p className="text-sm line-clamp-1 mt-0.5" style={{ color: "#64748b" }}>{course.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm" style={{ color: "#e2e8f0" }}>{course.instructor.name}</p>
                      <p className="text-xs" style={{ color: "#64748b" }}>{course.instructor.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(124,58,237,0.12)", color: "#a855f7" }}>
                        {course.semester}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: vs.bg, color: vs.color, border: `1px solid ${vs.border}` }}>
                        {vs.label}
                      </span>
                      {course.visibility === "PUBLIC" && course.isApproved && (
                        <span className="ml-1 text-xs" style={{ color: "#22c55e" }}>✓</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm" style={{ color: course.price > 0 ? "#c084fc" : "#22c55e" }}>
                        {course.price > 0 ? `Rp ${course.price.toLocaleString("id-ID")}` : "Gratis"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-0.5" style={{ color: "#94a3b8" }}>
                        <p>{course._count.modules} modul</p>
                        <p>{course._count.enrollments} peserta</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm" style={{ color: "#64748b" }}>
                        {new Date(course.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {courses.length === 0 && (
          <div className="py-12 text-center" style={{ color: "#64748b" }}>Belum ada kursus di platform.</div>
        )}
      </div>
    </div>
  );
}
