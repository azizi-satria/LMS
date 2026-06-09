import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function BrowsePage() {
  const courses = await prisma.course.findMany({
    where: { visibility: "PUBLIC", isApproved: true },
    include: {
      instructor: { select: { name: true } },
      _count: { select: { enrollments: true, modules: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Group by semester
  const semesters = [...new Set(courses.map((c) => c.semester))];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Page header */}
      <div className="mb-10">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4"
          style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", color: "#a855f7" }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
          Akses Publik
        </div>
        <h1 className="text-4xl font-extrabold mb-3" style={{ color: "var(--text-primary)" }}>
          Jelajahi Semua Kursus
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          {courses.length} kursus tersedia &mdash; Daftar untuk mengakses semua materi
        </p>
      </div>

      {courses.length === 0 ? (
        <div
          className="rounded-2xl p-16 text-center"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
        >
          <svg
            className="w-14 h-14 mx-auto mb-4"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
            style={{ color: "var(--text-faint)" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p style={{ color: "var(--text-muted)" }}>Belum ada kursus yang tersedia.</p>
          <Link href="/login" className="gradient-btn px-6 py-2.5 rounded-xl text-sm font-semibold mt-6 inline-block">
            Masuk sebagai Dosen untuk Membuat Kursus
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          {semesters.map((semester) => {
            const semCourses = courses.filter((c) => c.semester === semester);
            return (
              <div key={semester}>
                <div className="flex items-center gap-3 mb-5">
                  <span
                    className="px-3 py-1.5 rounded-lg text-sm font-semibold"
                    style={{
                      background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.1))",
                      color: "#a855f7",
                      border: "1px solid rgba(124,58,237,0.2)",
                    }}
                  >
                    {semester}
                  </span>
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                    {semCourses.length} kursus
                  </span>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {semCourses.map((course) => (
                    <Link key={course.id} href={`/browse/${course.id}`} className="block group">
                      <div className="glass-card-hover p-6 h-full flex flex-col">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                              {course.title}
                            </h3>
                            <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
                              {course.instructor.name}
                            </p>
                          </div>
                        </div>

                        <p className="text-sm line-clamp-2 mb-4 flex-1" style={{ color: "var(--text-description)" }}>
                          {course.description}
                        </p>

                        <div className="flex items-center justify-between text-xs" style={{ color: "var(--text-muted)" }}>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                              {course._count.modules} modul
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              {course._count.enrollments}
                            </span>
                          </div>
                          <span
                            className="flex items-center gap-1 font-medium"
                            style={{ color: "#a855f7" }}
                          >
                            Lihat Detail
                            <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CTA Banner */}
      {courses.length > 0 && (
        <div
          className="mt-16 rounded-2xl p-10 text-center relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(6,182,212,0.08))",
            border: "1px solid rgba(124,58,237,0.2)",
          }}
        >
          <h3 className="text-2xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
            Ingin Mulai Belajar?
          </h3>
          <p className="mb-6" style={{ color: "var(--text-muted)" }}>
            Daftarkan diri dan akses semua materi, tandai progress, dan raih prestasi terbaik.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/register" className="gradient-btn px-6 py-3 rounded-xl font-semibold">
              Daftar Sekarang
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 rounded-xl font-semibold transition-all"
              style={{ border: "1px solid var(--border-muted)", color: "var(--text-primary)", background: "var(--bg-card)" }}
            >
              Sudah Punya Akun
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
