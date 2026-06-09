import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminCoursesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dashboard");

  const courses = await prisma.course.findMany({
    include: { instructor: { select: { name: true, email: true } }, _count: { select: { enrollments: true, modules: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Semua Kursus</h1><p className="text-gray-500 mt-1">Total {courses.length} kursus di platform</p></div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{courses.filter((c) => c.isPublished).length} dipublikasikan</span>
          <span>{courses.filter((c) => !c.isPublished).length} draft</span>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Kursus", "Dosen", "Semester", "Status", "Statistik", "Dibuat"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4"><p className="font-medium text-gray-900">{course.title}</p><p className="text-sm text-gray-500 line-clamp-1">{course.description}</p></td>
                  <td className="px-6 py-4"><p className="text-sm text-gray-700">{course.instructor.name}</p><p className="text-xs text-gray-500">{course.instructor.email}</p></td>
                  <td className="px-6 py-4"><span className="text-sm text-gray-600">{course.semester}</span></td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${ course.isPublished ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700" }`}>{course.isPublished ? "Dipublikasikan" : "Draft"}</span></td>
                  <td className="px-6 py-4"><div className="text-xs text-gray-500"><p>{course._count.modules} modul</p><p>{course._count.enrollments} mahasiswa</p></div></td>
                  <td className="px-6 py-4"><span className="text-sm text-gray-500">{new Date(course.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {courses.length === 0 && <div className="py-12 text-center text-gray-500">Belum ada kursus di platform.</div>}
      </div>
    </div>
  );
}
