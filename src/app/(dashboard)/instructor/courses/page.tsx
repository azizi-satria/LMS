import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import CourseCard from "@/components/CourseCard";

export default async function InstructorCoursesPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "DOSEN") {
    redirect("/dashboard");
  }

  const courses = await prisma.course.findMany({
    where: { instructorId: session.user.id },
    include: {
      _count: { select: { enrollments: true, modules: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#f1f5f9" }}>Kursus Saya</h1>
          <p className="mt-1" style={{ color: "#64748b" }}>Kelola semua kursus yang Anda buat</p>
        </div>
        <Link
          href="/instructor/courses/new"
          className="gradient-btn px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Buat Kursus Baru
        </Link>
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
          <p className="mb-4" style={{ color: "#64748b" }}>Belum ada kursus. Buat kursus pertama Anda!</p>
          <Link href="/instructor/courses/new" className="gradient-btn px-6 py-2 rounded-xl text-sm font-semibold inline-block">
            Buat Kursus
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <div key={course.id} className="relative">
              <CourseCard
                course={course}
                href={`/instructor/courses/${course.id}/edit`}
                showStatus
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
