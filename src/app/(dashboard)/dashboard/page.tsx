import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import EnrollmentBarChart from "@/components/charts/EnrollmentBarChart";
import ProgressPieChart from "@/components/charts/ProgressPieChart";
import CourseLineChart from "@/components/charts/CourseLineChart";

const cardStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid #1e1e2e",
  borderRadius: "16px",
};

const statCardStyle = {
  background: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(6,182,212,0.06))",
  border: "1px solid rgba(124,58,237,0.15)",
  borderRadius: "16px",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { role, id: userId } = session.user;

  if (role === "ADMIN") {
    const [totalUsers, totalCourses, totalEnrollments] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.enrollment.count(),
    ]);

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    const topCourses = await prisma.course.findMany({
      take: 5,
      orderBy: { enrollments: { _count: "desc" } },
      select: {
        title: true,
        _count: { select: { enrollments: true } },
      },
    });

    const chartData = topCourses.map((c) => ({
      name: c.title.length > 20 ? c.title.slice(0, 20) + "…" : c.title,
      enrollments: c._count.enrollments,
    }));

    const roleColors: Record<string, { bg: string; color: string; border: string }> = {
      ADMIN: { bg: "rgba(239,68,68,0.12)", color: "#f87171", border: "rgba(239,68,68,0.25)" },
      DOSEN: { bg: "rgba(168,85,247,0.12)", color: "#c084fc", border: "rgba(168,85,247,0.25)" },
      MAHASISWA: { bg: "rgba(16,185,129,0.12)", color: "#34d399", border: "rgba(16,185,129,0.25)" },
    };

    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{ color: "#f1f5f9" }}>Dashboard Administrator</h1>
          <p className="mt-1" style={{ color: "#64748b" }}>Selamat datang, {session.user.name}</p>
        </div>

        <div className="grid grid-cols-3 gap-5 mb-8">
          {[
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              ),
              value: totalUsers,
              label: "Total Pengguna",
              color: "#a855f7",
              colorBg: "rgba(168,85,247,0.15)",
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              ),
              value: totalCourses,
              label: "Total Kursus",
              color: "#06b6d4",
              colorBg: "rgba(6,182,212,0.15)",
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              ),
              value: totalEnrollments,
              label: "Total Pendaftaran",
              color: "#10b981",
              colorBg: "rgba(16,185,129,0.15)",
            },
          ].map((stat) => (
            <div key={stat.label} style={statCardStyle} className="p-6">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: stat.colorBg, color: stat.color }}
                >
                  {stat.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: "#f1f5f9" }}>{stat.value}</p>
                  <p className="text-sm" style={{ color: "#64748b" }}>{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div style={cardStyle} className="p-6">
            <h2 className="font-semibold mb-4" style={{ color: "#f1f5f9" }}>
              Top 5 Kursus (Mahasiswa Terdaftar)
            </h2>
            {chartData.length > 0 ? (
              <EnrollmentBarChart data={chartData} />
            ) : (
              <p className="text-center py-10" style={{ color: "#64748b" }}>Belum ada data</p>
            )}
          </div>

          <div style={cardStyle}>
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ borderBottom: "1px solid #1e1e2e" }}
            >
              <h2 className="font-semibold" style={{ color: "#f1f5f9" }}>Pengguna Terbaru</h2>
              <Link href="/admin/users" className="text-sm transition-colors" style={{ color: "#a855f7" }}>
                Lihat Semua
              </Link>
            </div>
            <div>
              {recentUsers.map((user, idx) => {
                const rs = roleColors[user.role] || roleColors.MAHASISWA;
                return (
                  <div
                    key={user.id}
                    className="px-6 py-4 flex items-center justify-between"
                    style={{ borderTop: idx > 0 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                  >
                    <div>
                      <p className="font-medium" style={{ color: "#f1f5f9" }}>{user.name}</p>
                      <p className="text-sm" style={{ color: "#64748b" }}>{user.email}</p>
                    </div>
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{ background: rs.bg, color: rs.color, border: `1px solid ${rs.border}` }}
                    >
                      {user.role === "ADMIN" ? "Admin" : user.role === "DOSEN" ? "Dosen" : "Mahasiswa"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (role === "DOSEN") {
    const courses = await prisma.course.findMany({
      where: { instructorId: userId },
      include: {
        _count: { select: { enrollments: true, modules: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalStudents = courses.reduce((sum, c) => sum + c._count.enrollments, 0);
    const publishedCount = courses.filter((c) => c.isPublished).length;

    const chartData = courses.slice(0, 6).map((c) => ({
      name: c.title.length > 16 ? c.title.slice(0, 16) + "…" : c.title,
      mahasiswa: c._count.enrollments,
    }));

    return (
      <div>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#f1f5f9" }}>Dashboard Dosen</h1>
            <p className="mt-1" style={{ color: "#64748b" }}>Selamat datang, {session.user.name}</p>
          </div>
          <Link
            href="/instructor/courses/new"
            className="gradient-btn px-4 py-2 rounded-xl text-sm font-semibold"
          >
            + Buat Kursus Baru
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-5 mb-8">
          {[
            { value: courses.length, label: "Total Kursus", color: "#a855f7", colorBg: "rgba(168,85,247,0.15)" },
            { value: publishedCount, label: "Dipublikasikan", color: "#06b6d4", colorBg: "rgba(6,182,212,0.15)" },
            { value: totalStudents, label: "Total Mahasiswa", color: "#10b981", colorBg: "rgba(16,185,129,0.15)" },
          ].map((stat) => (
            <div key={stat.label} style={statCardStyle} className="p-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-lg font-bold"
                style={{ background: stat.colorBg, color: stat.color }}
              >
                {stat.value}
              </div>
              <p className="text-2xl font-bold" style={{ color: "#f1f5f9" }}>{stat.value}</p>
              <p className="text-sm" style={{ color: "#64748b" }}>{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div style={cardStyle} className="p-6">
            <h2 className="font-semibold mb-4" style={{ color: "#f1f5f9" }}>Mahasiswa per Kursus</h2>
            {chartData.length > 0 ? (
              <CourseLineChart data={chartData} />
            ) : (
              <p className="text-center py-10" style={{ color: "#64748b" }}>Belum ada data</p>
            )}
          </div>

          <div style={cardStyle}>
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ borderBottom: "1px solid #1e1e2e" }}
            >
              <h2 className="font-semibold" style={{ color: "#f1f5f9" }}>Kursus Saya</h2>
              <Link href="/instructor/courses" className="text-sm" style={{ color: "#a855f7" }}>
                Kelola Semua
              </Link>
            </div>
            {courses.length === 0 ? (
              <div className="px-6 py-12 text-center" style={{ color: "#64748b" }}>
                <p className="mb-4">Belum ada kursus.</p>
                <Link href="/instructor/courses/new" className="font-medium" style={{ color: "#a855f7" }}>
                  Buat Kursus Sekarang &rarr;
                </Link>
              </div>
            ) : (
              <div>
                {courses.slice(0, 5).map((course, idx) => (
                  <div
                    key={course.id}
                    className="px-6 py-4 flex items-center justify-between"
                    style={{ borderTop: idx > 0 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                  >
                    <div>
                      <p className="font-medium text-sm" style={{ color: "#f1f5f9" }}>{course.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                        {course._count.modules} modul &middot; {course._count.enrollments} mahasiswa
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={
                          course.isPublished
                            ? { background: "rgba(16,185,129,0.12)", color: "#34d399", border: "1px solid rgba(16,185,129,0.25)" }
                            : { background: "rgba(245,158,11,0.12)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.25)" }
                        }
                      >
                        {course.isPublished ? "Aktif" : "Draft"}
                      </span>
                      <Link
                        href={`/instructor/courses/${course.id}/edit`}
                        className="text-xs font-medium"
                        style={{ color: "#a855f7" }}
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // MAHASISWA
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          instructor: { select: { name: true } },
          modules: {
            include: {
              materials: {
                include: {
                  progress: { where: { userId } },
                },
              },
            },
          },
          _count: { select: { modules: true } },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  const totalMaterials = enrollments.reduce((sum, e) => {
    return sum + e.course.modules.reduce((mSum, m) => mSum + m.materials.length, 0);
  }, 0);

  const completedMaterials = enrollments.reduce((sum, e) => {
    return sum + e.course.modules.reduce((mSum, m) => {
      return mSum + m.materials.filter((mat) => mat.progress.length > 0).length;
    }, 0);
  }, 0);

  const overallProgress = totalMaterials > 0 ? Math.round((completedMaterials / totalMaterials) * 100) : 0;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#f1f5f9" }}>Dashboard Mahasiswa</h1>
          <p className="mt-1" style={{ color: "#64748b" }}>Selamat datang, {session.user.name}</p>
        </div>
        <Link href="/courses" className="gradient-btn px-4 py-2 rounded-xl text-sm font-semibold">
          Jelajahi Kursus
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-5 mb-8">
        {[
          { value: enrollments.length, label: "Kursus Diikuti", color: "#a855f7", colorBg: "rgba(168,85,247,0.15)" },
          { value: completedMaterials, label: "Materi Selesai", color: "#06b6d4", colorBg: "rgba(6,182,212,0.15)" },
          { value: `${overallProgress}%`, label: "Progress Keseluruhan", color: "#10b981", colorBg: "rgba(16,185,129,0.15)" },
        ].map((stat) => (
          <div key={stat.label} style={statCardStyle} className="p-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: stat.colorBg, color: stat.color }}
            >
              <span className="text-sm font-bold">{stat.value}</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "#f1f5f9" }}>{stat.value}</p>
            <p className="text-sm" style={{ color: "#64748b" }}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div style={cardStyle} className="p-6">
          <h2 className="font-semibold mb-6" style={{ color: "#f1f5f9" }}>Ringkasan Progress</h2>
          <ProgressPieChart
            progress={overallProgress}
            totalCourses={enrollments.length}
            completedMaterials={completedMaterials}
          />
        </div>

        <div style={cardStyle}>
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{ borderBottom: "1px solid #1e1e2e" }}
          >
            <h2 className="font-semibold" style={{ color: "#f1f5f9" }}>Kursus Saya</h2>
            <Link href="/courses" className="text-sm" style={{ color: "#a855f7" }}>
              Jelajahi Lebih
            </Link>
          </div>
          {enrollments.length === 0 ? (
            <div className="px-6 py-12 text-center" style={{ color: "#64748b" }}>
              <p className="mb-4">Belum terdaftar di kursus apapun.</p>
              <Link href="/courses" className="font-medium" style={{ color: "#a855f7" }}>
                Jelajahi Kursus &rarr;
              </Link>
            </div>
          ) : (
            <div>
              {enrollments.map((enrollment, idx) => {
                const course = enrollment.course;
                const totalMat = course.modules.reduce((s, m) => s + m.materials.length, 0);
                const completedMat = course.modules.reduce((s, m) => {
                  return s + m.materials.filter((mat) => mat.progress.length > 0).length;
                }, 0);
                const progress = totalMat > 0 ? Math.round((completedMat / totalMat) * 100) : 0;

                return (
                  <div
                    key={enrollment.id}
                    className="px-6 py-4"
                    style={{ borderTop: idx > 0 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm" style={{ color: "#f1f5f9" }}>{course.title}</p>
                        <p className="text-xs" style={{ color: "#64748b" }}>{course.instructor?.name}</p>
                      </div>
                      <Link
                        href={`/courses/${course.id}`}
                        className="text-xs font-medium"
                        style={{ color: "#a855f7" }}
                      >
                        Lanjutkan
                      </Link>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className="flex-1 rounded-full h-1.5"
                        style={{ background: "rgba(255,255,255,0.08)" }}
                      >
                        <div
                          className="h-full rounded-full progress-glow"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs flex-shrink-0" style={{ color: "#64748b" }}>
                        {progress}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
