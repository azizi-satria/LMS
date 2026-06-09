"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import MaterialList from "@/components/MaterialList";
import Link from "next/link";

interface Course {
  id: string; title: string; description: string; semester: string;
  instructor: { name: string };
  modules: { id: string; title: string; order: number; materials: { id: string; title: string; type: "VIDEO" | "PDF" | "DOCUMENT" | "LINK"; contentUrl: string; order: number }[] }[];
  _count: { enrollments: number };
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [course, setCourse] = useState<Course | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/courses/${params.id}`);
        if (!res.ok) { router.push("/courses"); return; }
        const data = await res.json();
        setCourse(data.course);
        setIsEnrolled(data.isEnrolled);
        setCompletedIds(data.completedMaterialIds || []);
      } finally { setLoading(false); }
    }
    fetchData();
  }, [params.id, router]);

  async function handleEnroll() {
    setEnrollLoading(true);
    try {
      const res = await fetch(`/api/courses/${params.id}/enroll`, { method: "POST" });
      if (res.ok) setIsEnrolled(true);
    } finally { setEnrollLoading(false); }
  }

  async function handleMarkComplete(materialId: string) {
    const res = await fetch("/api/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ materialId }) });
    if (res.ok) setCompletedIds((prev) => [...prev, materialId]);
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;
  if (!course) return null;

  const totalMaterials = course.modules.reduce((s, m) => s + m.materials.length, 0);
  const progress = totalMaterials > 0 ? Math.round((completedIds.length / totalMaterials) * 100) : 0;

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/courses" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4">← Kembali ke Daftar Kursus</Link>
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-md font-medium">{course.semester}</span>
              <h1 className="text-2xl font-bold text-gray-900 mt-3 mb-2">{course.title}</h1>
              <p className="text-gray-600 mb-4">{course.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Dosen: {course.instructor.name}</span>
                <span>{course._count.enrollments} mahasiswa terdaftar</span>
                <span>{course.modules.length} modul</span>
              </div>
            </div>
            {session?.user?.role === "MAHASISWA" && (
              <div className="ml-6 flex-shrink-0">
                {isEnrolled ? (
                  <div className="text-center">
                    <div className="w-20 h-20 relative">
                      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#2563EB" strokeWidth="3" strokeDasharray={`${progress}, 100`} />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">{progress}%</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Progress</p>
                  </div>
                ) : (
                  <button onClick={handleEnroll} disabled={enrollLoading} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
                    {enrollLoading ? "Mendaftar..." : "Daftar Kursus"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        {isEnrolled && totalMaterials > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">Progress Belajar</span>
              <span className="text-sm text-blue-600">{completedIds.length}/{totalMaterials} materi selesai</span>
            </div>
            <div className="bg-blue-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Konten Kursus</h2>
          {!isEnrolled && session?.user?.role === "MAHASISWA" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-sm text-yellow-800">
              Daftar ke kursus ini untuk mengakses semua materi dan melacak progress Anda.
            </div>
          )}
          <MaterialList modules={course.modules} completedMaterialIds={completedIds} onMarkComplete={isEnrolled ? handleMarkComplete : undefined} isEnrolled={isEnrolled} />
        </div>
      </div>
    </div>
  );
}
