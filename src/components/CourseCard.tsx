import Link from "next/link";

type CourseVisibility = "DRAFT" | "INTERNAL" | "PUBLIC";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    semester: string;
    visibility?: CourseVisibility;
    price?: number;
    isApproved?: boolean;
    instructor?: { name: string };
    _count?: { enrollments: number; modules: number };
  };
  href: string;
  showStatus?: boolean;
  progress?: number;
}

const visibilityStyles: Record<CourseVisibility, { bg: string; color: string; border: string; label: string }> = {
  DRAFT: { bg: "rgba(100,116,139,0.15)", color: "#94a3b8", border: "rgba(100,116,139,0.3)", label: "Draft" },
  INTERNAL: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "rgba(245,158,11,0.3)", label: "Internal" },
  PUBLIC: { bg: "rgba(34,197,94,0.15)", color: "#22c55e", border: "rgba(34,197,94,0.3)", label: "Publik" },
};

export default function CourseCard({ course, href, showStatus = false, progress }: CourseCardProps) {
  const vis = course.visibility ? visibilityStyles[course.visibility] : null;
  const isFree = !course.price || course.price === 0;

  return (
    <Link href={href} className="block h-full">
      <div className="glass-card-hover p-6 h-full flex flex-col" style={{ cursor: "pointer" }}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold truncate" style={{ color: "#f1f5f9" }}>
              {course.title}
            </h3>
            {course.instructor && (
              <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>{course.instructor.name}</p>
            )}
          </div>
          {showStatus && vis && (
            <span
              className="ml-2 flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ background: vis.bg, color: vis.color, border: `1px solid ${vis.border}` }}
            >
              {vis.label}
            </span>
          )}
        </div>

        <p className="text-sm line-clamp-2 mb-4 flex-1" style={{ color: "#94a3b8" }}>{course.description}</p>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="px-2.5 py-1 rounded-lg font-medium"
                style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.1))", color: "#a855f7", border: "1px solid rgba(124,58,237,0.2)" }}
              >
                {course.semester}
              </span>
              {course.visibility === "PUBLIC" && (
                <span
                  className="px-2 py-0.5 rounded-lg font-semibold"
                  style={isFree ? { background: "rgba(34,197,94,0.15)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)" } : { background: "rgba(168,85,247,0.15)", color: "#c084fc", border: "1px solid rgba(168,85,247,0.3)" }}
                >
                  {isFree ? "Gratis" : `Rp ${(course.price ?? 0).toLocaleString("id-ID")}`}
                </span>
              )}
            </div>
            {course._count && (
              <div className="flex items-center gap-3" style={{ color: "#64748b" }}>
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  {course._count.modules} modul
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {course._count.enrollments}
                </span>
              </div>
            )}
          </div>

          {progress !== undefined && (
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span style={{ color: "#64748b" }}>Progress</span>
                <span style={{ color: "#a855f7" }}>{progress}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div className="h-full rounded-full progress-glow transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
