import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import CourseCard from "@/components/CourseCard";

export default async function InstructorCoursesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "DOSEN") redirect("/dashboard");

  const courses = await prisma.course.findMany({
    where: { instructorId: session.user.id },
    include: { _count: { select: { enrollments: true, modules: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Kursus Saya</h1><p className="text-gray-500 mt-1">Kelola semua kursus yang Anda buat</p></div>
        <Link href="/instructor/courses/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Buat Kursus Baru</Link>
      </div>
      {courses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500 mb-4">Belum ada kursus. Buat kursus pertama Anda!</p>
          <Link href="/instructor/courses/new" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 inline-block">Buat Kursus</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="relative">
              <CourseCard course={course} href={`/instructor/courses/${course.id}/edit`} showStatus />
              <div className="absolute top-4 right-4">
                <Link href={`/instructor/courses/${course.id}/edit`} className="bg-white border border-gray-200 text-gray-600 text-xs px-2 py-1 rounded-md hover:bg-gray-50">Edit</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
