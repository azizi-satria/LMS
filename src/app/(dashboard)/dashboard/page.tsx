import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { role, id: userId } = session.user;

  if (role === "ADMIN") {
    const [totalUsers, totalCourses, totalEnrollments] = await Promise.all([
      prisma.user.count(), prisma.course.count(), prisma.enrollment.count(),
    ]);
    const recentUsers = await prisma.user.findMany({ take: 5, orderBy: { createdAt: "desc" }, select: { id: true, name: true, email: true, role: true, createdAt: true } });

    return (
      <div>
        <div className="mb-8"><h1 className="text-2xl font-bold text-gray-900">Dashboard Administrator</h1><p className="text-gray-500 mt-1">Selamat datang, {session.user.name}</p></div>
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"><p className="text-2xl font-bold text-gray-900">{totalUsers}</p><p className="text-sm text-gray-500 mt-1">Total Pengguna</p></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"><p className="text-2xl font-bold text-gray-900">{totalCourses}</p><p className="text-sm text-gray-500 mt-1">Total Kursus</p></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"><p className="text-2xl font-bold text-gray-900">{totalEnrollments}</p><p className="text-sm text-gray-500 mt-1">Total Pendaftaran</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Pengguna Terbaru</h2>
            <Link href="/admin/users" className="text-sm text-blue-600 hover:text-blue-700">Lihat Semua</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentUsers.map((user) => (
              <div key={user.id} className="px-6 py-4 flex items-center justify-between">
                <div><p className="font-medium text-gray-900">{user.name}</p><p className="text-sm text-gray-500">{user.email}</p></div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${ user.role === "ADMIN" ? "bg-red-100 text-red-700" : user.role === "DOSEN" ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700" }`}>
                  {user.role === "ADMIN" ? "Admin" : user.role === "DOSEN" ? "Dosen" : "Mahasiswa"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (role === "DOSEN") {
    const courses = await prisma.course.findMany({
      where: { instructorId: userId },
      include: { _count: { select: { enrollments: true, modules: true } } },
      orderBy: { createdAt: "desc" },
    });
    const totalStudents = courses.reduce((sum, c) => sum + c._count.enrollments, 0);

    return (
      <div>
        <div className="mb-8 flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-gray-900">Dashboard Dosen</h1><p className="text-gray-500 mt-1">Selamat datang, {session.user.name}</p></div>
          <Link href="/instructor/courses/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">+ Buat Kursus Baru</Link>
        </div>
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"><p className="text-2xl font-bold text-gray-900">{courses.length}</p><p className="text-sm text-gray-500 mt-1">Total Kursus</p></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"><p className="text-2xl font-bold text-gray-900">{courses.filter(c => c.isPublished).length}</p><p className="text-sm text-gray-500 mt-1">Dipublikasikan</p></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"><p className="text-2xl font-bold text-gray-900">{totalStudents}</p><p className="text-sm text-gray-500 mt-1">Total Mahasiswa</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Kursus Saya</h2>
            <Link href="/instructor/courses" className="text-sm text-blue-600 hover:text-blue-700">Kelola Semua</Link>
          </div>
          {courses.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <p className="mb-4">Belum ada kursus. Buat kursus pertama Anda!</p>
              <Link href="/instructor/courses/new" className="text-blue-600 hover:text-blue-700 font-medium">Buat Kursus Sekarang →</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {courses.slice(0, 5).map((course) => (
                <div key={course.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{course.title}</p>
                    <p className="text-sm text-gray-500">{course._count.modules} modul · {course._count.enrollments} mahasiswa</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${ course.isPublished ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700" }`}>
                      {course.isPublished ? "Dipublikasikan" : "Draft"}
                    </span>
                    <Link href={`/instructor/courses/${course.id}/edit`} className="text-sm text-blue-600 hover:text-blue-700">Edit</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
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
          modules: { include: { materials: { include: { progress: { where: { userId } } } } } },
          _count: { select: { modules: true } },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  const totalMaterials = enrollments.reduce((sum, e) => sum + e.course.modules.reduce((mSum, m) => mSum + m.materials.length, 0), 0);
  const completedMaterials = enrollments.reduce((sum, e) => sum + e.course.modules.reduce((mSum, m) => mSum + m.materials.filter((mat) => mat.progress.length > 0).length, 0), 0);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Dashboard Mahasiswa</h1><p className="text-gray-500 mt-1">Selamat datang, {session.user.name}</p></div>
        <Link href="/courses" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Jelajahi Kursus</Link>
      </div>
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"><p className="text-2xl font-bold text-gray-900">{enrollments.length}</p><p className="text-sm text-gray-500 mt-1">Kursus Diikuti</p></div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"><p className="text-2xl font-bold text-gray-900">{completedMaterials}</p><p className="text-sm text-gray-500 mt-1">Materi Selesai</p></div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"><p className="text-2xl font-bold text-gray-900">{totalMaterials > 0 ? Math.round((completedMaterials / totalMaterials) * 100) : 0}%</p><p className="text-sm text-gray-500 mt-1">Progress Keseluruhan</p></div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Kursus Saya</h2>
          <Link href="/courses" className="text-sm text-blue-600 hover:text-blue-700">Jelajahi Lebih</Link>
        </div>
        {enrollments.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <p className="mb-4">Belum terdaftar di kursus apapun.</p>
            <Link href="/courses" className="text-blue-600 hover:text-blue-700 font-medium">Jelajahi Kursus →</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {enrollments.map((enrollment) => {
              const course = enrollment.course;
              const totalMat = course.modules.reduce((s, m) => s + m.materials.length, 0);
              const completedMat = course.modules.reduce((s, m) => s + m.materials.filter((mat) => mat.progress.length > 0).length, 0);
              const progress = totalMat > 0 ? Math.round((completedMat / totalMat) * 100) : 0;
              return (
                <div key={enrollment.id} className="px-6 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <div><p className="font-medium text-gray-900">{course.title}</p><p className="text-sm text-gray-500">{course.instructor?.name}</p></div>
                    <Link href={`/courses/${course.id}`} className="text-sm text-blue-600 hover:text-blue-700 font-medium">Lanjutkan</Link>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">{progress}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
