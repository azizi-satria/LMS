import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";

const materialTypeLabels = { VIDEO: "Video", PDF: "PDF", DOCUMENT: "Dokumen", LINK: "Tautan" };
const materialTypeColors = {
  VIDEO: { bg: "rgba(239,68,68,0.1)", color: "#f87171" },
  PDF: { bg: "rgba(249,115,22,0.1)", color: "#fb923c" },
  DOCUMENT: { bg: "rgba(59,130,246,0.1)", color: "#60a5fa" },
  LINK: { bg: "rgba(16,185,129,0.1)", color: "#34d399" },
};

export default async function PublicCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const course = await prisma.course.findUnique({
    where: { id, visibility: "PUBLIC", isApproved: true },
    include: {
      instructor: { select: { name: true, nip: true } },
      modules: {
        orderBy: { order: "asc" },
        include: {
          materials: { orderBy: { order: "asc" } },
        },
      },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) notFound();

  const totalMaterials = course.modules.reduce((s, m) => s + m.materials.length, 0);

  // Check if logged-in user is enrolled
  let isEnrolled = false;
  if (session?.user) {
    const enroll = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId: id } },
    });
    isEnrolled = !!enroll;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <Link
        href="/browse"
        className="flex items-center gap-1.5 text-sm mb-8 transition-colors hover:text-purple-400"
        style={{ color: "var(--text-muted)" }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Kembali ke Daftar Kursus
      </Link>

      {/* Course Header */}
      <div
        className="rounded-2xl p-8 mb-6 relative overflow-hidden"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-color)" }}
      >
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)", transform: "translate(30%, -30%)" }}
        />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span
              className="px-3 py-1 rounded-lg text-xs font-semibold"
              style={{
                background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.1))",
                color: "#a855f7",
                border: "1px solid rgba(124,58,237,0.2)",
              }}
            >
              {course.semester}
            </span>
            <span
              className="px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}
            >
              Dipublikasikan
            </span>
          </div>

          <h1 className="text-3xl font-extrabold mb-3" style={{ color: "var(--text-primary)" }}>
            {course.title}
          </h1>
          <p className="text-base mb-6 leading-relaxed" style={{ color: "var(--text-description)" }}>
            {course.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-sm" style={{ color: "var(--text-muted)" }}>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {course.instructor.name}
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {course.modules.length} Modul
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {totalMaterials} Materi
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {course._count.enrollments} Mahasiswa
            </span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Course content */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Konten Kursus</h2>

          {course.modules.length === 0 ? (
            <div
              className="rounded-xl p-8 text-center"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
            >
              <p style={{ color: "var(--text-muted)" }}>Belum ada modul tersedia.</p>
            </div>
          ) : (
            course.modules.map((module) => (
              <div
                key={module.id}
                className="rounded-xl overflow-hidden"
                style={{ border: "1px solid var(--border-color)" }}
              >
                <div
                  className="px-5 py-4 flex items-center justify-between"
                  style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border-color)" }}
                >
                  <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>{module.title}</h3>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {module.materials.length} materi
                  </span>
                </div>
                <div style={{ background: "var(--bg-surface)" }}>
                  {module.materials.length === 0 ? (
                    <p className="px-5 py-3 text-sm" style={{ color: "var(--text-muted)" }}>Belum ada materi</p>
                  ) : (
                    module.materials.map((mat, idx) => {
                      const ts = materialTypeColors[mat.type as keyof typeof materialTypeColors];
                      return (
                        <div
                          key={mat.id}
                          className="px-5 py-3 flex items-center gap-3"
                          style={{ borderTop: idx > 0 ? "1px solid var(--border-color)" : "none" }}
                        >
                          <span
                            className="px-2 py-0.5 rounded text-xs font-medium flex-shrink-0"
                            style={{ background: ts.bg, color: ts.color }}
                          >
                            {materialTypeLabels[mat.type as keyof typeof materialTypeLabels]}
                          </span>
                          <span className="text-sm" style={{ color: "var(--text-primary)" }}>{mat.title}</span>
                          {!session ? (
                            <span className="ml-auto flex-shrink-0">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--text-faint)" }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </span>
                          ) : !isEnrolled ? (
                            <span className="ml-auto flex-shrink-0">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--text-faint)" }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </span>
                          ) : (
                            <a
                              href={mat.contentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-auto text-xs font-medium flex-shrink-0 transition-colors hover:text-purple-300"
                              style={{ color: "#a855f7" }}
                            >
                              Buka
                            </a>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sidebar CTA */}
        <div className="space-y-4">
          <div
            className="rounded-2xl p-6 sticky top-24"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-color)" }}
          >
            <div className="text-center mb-5">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>Ikuti Kursus Ini</p>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Gratis untuk mahasiswa terdaftar</p>
            </div>

            {!session ? (
              <>
                <Link href="/register" className="gradient-btn w-full py-3 rounded-xl font-semibold text-center block mb-3">
                  Daftar & Mulai Belajar
                </Link>
                <Link
                  href={`/login?callbackUrl=/courses/${id}`}
                  className="w-full py-3 rounded-xl font-medium text-center block transition-all"
                  style={{ border: "1px solid var(--border-muted)", color: "var(--text-primary)", background: "var(--bg-card)" }}
                >
                  Sudah Punya Akun? Masuk
                </Link>
              </>
            ) : isEnrolled ? (
              <Link href={`/courses/${id}`} className="gradient-btn w-full py-3 rounded-xl font-semibold text-center block">
                Lanjutkan Belajar &rarr;
              </Link>
            ) : (
              <Link href={`/courses/${id}`} className="gradient-btn w-full py-3 rounded-xl font-semibold text-center block">
                Daftar Kursus Sekarang
              </Link>
            )}

            <div
              className="mt-5 pt-5 space-y-3 text-sm"
              style={{ borderTop: "1px solid var(--border-color)" }}
            >
              {[
                { icon: "📚", text: `${course.modules.length} Modul pembelajaran` },
                { icon: "📄", text: `${totalMaterials} Materi (Video, PDF, dll)` },
                { icon: "✅", text: "Lacak progress belajar" },
                { icon: "🎓", text: "Pengajar berpengalaman" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                  <span>{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
