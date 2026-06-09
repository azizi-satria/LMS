import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CourseCard from "@/components/CourseCard";

export default async function CoursesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    include: { instructor: { select: { name: true } }, _count: { select: { enrollments: true, modules: true } } },
    orderBy: { createdAt: "desc" },
  });

  const userEnrollments = await prisma.enrollment.findMany({ where: { userId: session.user.id }, select: { courseId: true } });
  const enrolledCourseIds = new Set(userEnrollments.map((e) => e.courseId));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Jelajahi Kursus</h1>
        <p className="text-gray-500 mt-1">Temukan kursus yang sesuai dengan kebutuhan Anda</p>
      </div>
      {courses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">Belum ada kursus yang tersedia saat ini.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="relative">
              <CourseCard course={course} href={`/courses/${course.id}`} />
              {enrolledCourseIds.has(course.id) && (
                <div className="absolute top-4 right-4">
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">Terdaftar</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
