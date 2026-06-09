import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CourseCard from "@/components/CourseCard";

export default async function CoursesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    include: {
      instructor: { select: { name: true } },
      _count: { select: { enrollments: true, modules: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const userEnrollments = await prisma.enrollment.findMany({
    where: { userId: session.user.id },
    select: { courseId: true },
  });

  const enrolledCourseIds = new Set(userEnrollments.map((e) => e.courseId));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "#f1f5f9" }}>Jelajahi Kursus</h1>
        <p className="mt-1" style={{ color: "#64748b" }}>
          Temukan kursus yang sesuai dengan kebutuhan Anda
        </p>
      </div>

      {courses.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #1e1e2e" }}
        >
          <svg
            className="w-12 h-12 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: "#334155" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p style={{ color: "#64748b" }}>Belum ada kursus yang tersedia saat ini.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => {
            const isEnrolled = enrolledCourseIds.has(course.id);
            return (
              <div key={course.id} className="relative">
                <CourseCard course={course} href={`/courses/${course.id}`} />
                {isEnrolled && (
                  <div className="absolute top-4 right-4 pointer-events-none">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                        color: "white",
                      }}
                    >
                      Terdaftar
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
