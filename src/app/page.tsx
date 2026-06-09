import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PublicNavbar from "@/components/PublicNavbar";

async function getStats() {
  const [totalCourses, totalStudents, totalInstructors] = await Promise.all([
    prisma.course.count({ where: { visibility: "PUBLIC", isApproved: true } }),
    prisma.user.count({ where: { role: "MAHASISWA" } }),
    prisma.user.count({ where: { role: "DOSEN" } }),
  ]);
  return { totalCourses, totalStudents, totalInstructors };
}

async function getFeaturedCourses() {
  return prisma.course.findMany({
    where: { visibility: "PUBLIC", isApproved: true },
    include: {
      instructor: { select: { name: true } },
      _count: { select: { enrollments: true, modules: true } },
    },
    orderBy: { enrollments: { _count: "desc" } },
    take: 6,
  });
}

export default async function HomePage() {
  const [stats, featuredCourses] = await Promise.all([getStats(), getFeaturedCourses()]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      <PublicNavbar />

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden" style={{ padding: "80px 0 100px" }}>
        {/* Decorative orbs */}
        <div className="orb orb-purple animate-float" style={{ width: 600, height: 600, top: -200, left: -200, opacity: 0.5 }} />
        <div className="orb orb-cyan animate-float-delayed" style={{ width: 400, height: 400, top: -100, right: -100, opacity: 0.4 }} />
        <div className="orb orb-purple" style={{ width: 300, height: 300, bottom: -100, left: "50%", opacity: 0.3 }} />

        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
            style={{
              background: "rgba(124,58,237,0.12)",
              border: "1px solid rgba(124,58,237,0.25)",
              color: "#a855f7",
            }}
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Platform Pembelajaran Digital Kampus
          </div>

          <h1
            className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Belajar Lebih{" "}
            <span className="gradient-text animate-gradient">Cerdas</span>
            <br />
            & Menyenangkan
          </h1>

          <p
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10"
            style={{ color: "var(--text-muted)", lineHeight: 1.7 }}
          >
            Platform LMS modern untuk mahasiswa dan dosen. Akses materi kuliah, pantau progress belajar,
            dan raih prestasi terbaik Anda bersama kami.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="gradient-btn px-8 py-4 rounded-2xl text-base font-bold"
            >
              Mulai Belajar Sekarang &rarr;
            </Link>
            <Link
              href="/browse"
              className="px-8 py-4 rounded-2xl text-base font-semibold transition-all"
              style={{
                border: "1px solid var(--border-muted)",
                color: "var(--text-primary)",
                background: "var(--bg-card)",
              }}
            >
              Jelajahi Kursus
            </Link>
          </div>

          {/* Hero stats */}
          <div className="flex items-center justify-center gap-8 mt-14 flex-wrap">
            {[
              { value: stats.totalCourses + "+", label: "Kursus Aktif" },
              { value: stats.totalStudents + "+", label: "Mahasiswa" },
              { value: stats.totalInstructors + "+", label: "Dosen Pengajar" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p
                  className="text-3xl font-extrabold"
                  style={{
                    background: "linear-gradient(135deg, #a855f7, #06b6d4)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {s.value}
                </p>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section
        className="py-20"
        style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)" }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
              Mengapa Memilih LMS Kami?
            </h2>
            <p style={{ color: "var(--text-muted)" }}>Dirancang khusus untuk kebutuhan akademik kampus modern</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m1.636-6.364l.707.707M6.343 17.657l-.707.707M15.536 8.464l-.707.707m0 7.072l.707.707M4.929 19.071l-.707-.707M19.071 4.929l-.707.707" />
                  </svg>
                ),
                color: "#a855f7",
                colorBg: "rgba(168,85,247,0.12)",
                title: "Belajar Mandiri",
                desc: "Akses materi kapan saja dan di mana saja. Video, PDF, dokumen, dan tautan dalam satu platform.",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                color: "#06b6d4",
                colorBg: "rgba(6,182,212,0.12)",
                title: "Pantau Progress",
                desc: "Lacak kemajuan belajar secara real-time dengan visualisasi data yang interaktif dan informatif.",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                color: "#10b981",
                colorBg: "rgba(16,185,129,0.12)",
                title: "Manajemen Mudah",
                desc: "Dosen dapat mengelola kursus, modul, dan materi dengan antarmuka yang intuitif dan efisien.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="glass-card p-8 hover:translate-y-[-4px] transition-transform duration-300"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: f.colorBg, color: f.color }}
                >
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED COURSES ===== */}
      {featuredCourses.length > 0 && (
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Kursus Unggulan</h2>
                <p className="mt-2" style={{ color: "var(--text-muted)" }}>Dipilih berdasarkan popularitas dan kualitas materi</p>
              </div>
              <Link
                href="/browse"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  border: "1px solid rgba(124,58,237,0.3)",
                  color: "#a855f7",
                  background: "rgba(124,58,237,0.08)",
                }}
              >
                Lihat Semua &rarr;
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredCourses.map((course) => (
                <Link key={course.id} href={`/browse/${course.id}`} className="block group">
                  <div className="glass-card-hover p-6 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                          {course.title}
                        </h3>
                        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
                          {course.instructor.name}
                        </p>
                      </div>
                      {course._count.enrollments > 0 && (
                        <span
                          className="ml-2 flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)" }}
                        >
                          Populer
                        </span>
                      )}
                    </div>

                    <p className="text-sm line-clamp-2 mb-4 flex-1" style={{ color: "var(--text-description)" }}>
                      {course.description}
                    </p>

                    <div className="flex items-center justify-between text-xs">
                      <span
                        className="px-2.5 py-1 rounded-lg font-medium"
                        style={{
                          background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.1))",
                          color: "#a855f7",
                          border: "1px solid rgba(124,58,237,0.2)",
                        }}
                      >
                        {course.semester}
                      </span>
                      <div className="flex items-center gap-3" style={{ color: "var(--text-muted)" }}>
                        <span>{course._count.modules} modul</span>
                        <span>{course._count.enrollments} siswa</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== CTA ===== */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div
            className="relative overflow-hidden rounded-3xl p-12 text-center"
            style={{
              background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.1))",
              border: "1px solid rgba(124,58,237,0.2)",
            }}
          >
            <div className="orb orb-purple" style={{ width: 300, height: 300, top: -100, left: -100, opacity: 0.4 }} />
            <div className="orb orb-cyan" style={{ width: 250, height: 250, bottom: -80, right: -80, opacity: 0.3 }} />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4" style={{ color: "var(--text-primary)" }}>
                Siap Memulai Perjalanan Belajar?
              </h2>
              <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
                Daftar sekarang dan akses ratusan materi pembelajaran berkualitas dari dosen terbaik.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Link href="/register" className="gradient-btn px-8 py-4 rounded-2xl text-base font-bold">
                  Daftar Sebagai Mahasiswa
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-4 rounded-2xl text-base font-semibold transition-all"
                  style={{ border: "1px solid var(--border-muted)", color: "var(--text-primary)", background: "var(--bg-card)" }}
                >
                  Sudah Punya Akun? Masuk
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer
        className="py-10"
        style={{ borderTop: "1px solid var(--border-color)", background: "var(--bg-surface)" }}
      >
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>LMS Universitas</span>
          </div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            &copy; {new Date().getFullYear()} LMS Universitas. Platform Pembelajaran Digital.
          </p>
          <div className="flex items-center gap-4 text-sm" style={{ color: "var(--text-muted)" }}>
            <Link href="/browse" className="hover:text-purple-400 transition-colors">Kursus</Link>
            <Link href="/login" className="hover:text-purple-400 transition-colors">Masuk</Link>
            <Link href="/register" className="hover:text-purple-400 transition-colors">Daftar</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
