import Link from "next/link";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    semester: string;
    isPublished: boolean;
    instructor?: { name: string };
    _count?: { enrollments: number; modules: number };
  };
  href: string;
  showStatus?: boolean;
}

export default function CourseCard({ course, href, showStatus = false }: CourseCardProps) {
  return (
    <Link href={href} className="block">
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-blue-200 transition-all duration-200 h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 truncate">{course.title}</h3>
            {course.instructor && (
              <p className="text-sm text-gray-500 mt-0.5">{course.instructor.name}</p>
            )}
          </div>
          {showStatus && (
            <span className={`ml-2 flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
              course.isPublished ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
            }`}>
              {course.isPublished ? "Dipublikasikan" : "Draft"}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{course.description}</p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium">{course.semester}</span>
          {course._count && (
            <div className="flex items-center gap-3">
              <span>{course._count.modules} modul</span>
              <span>{course._count.enrollments} mahasiswa</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
