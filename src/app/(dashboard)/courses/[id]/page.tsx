"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import MaterialList from "@/components/MaterialList";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  description: string;
  semester: string;
  instructor: { name: string };
  modules: {
    id: string;
    title: string;
    order: number;
    materials: {
      id: string;
      title: string;
      type: "VIDEO" | "PDF" | "DOCUMENT" | "LINK";
      contentUrl: string;
      order: number;
    }[];
  }[];
  _count: { enrollments: number };
}

const cardStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid #1e1e2e",
  borderRadius: "16px",
};

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
        if (!res.ok) {
          router.push("/courses");
          return;
        }
        const data = await res.json();
        setCourse(data.course);
        setIsEnrolled(data.isEnrolled);
        setCompletedIds(data.completedMaterialIds || []);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.id, router]);

  async function handleEnroll() {
    setEnrollLoading(true);
    try {
      const res = await fetch(`/api/courses/${params.id}/enroll`, {
        method: "POST",
      });
      if (res.ok) {
        setIsEnrolled(true);
      }
    } finally {
      setEnrollLoading(false);
    }
  }

  async function handleMarkComplete(materialId: string) {
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ materialId }),
    });
    if (res.ok) {
      setCompletedIds((prev) => [...prev, materialId]);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="animate-spin rounded-full h-10 w-10 border-b-2"
          style={{ borderColor: "#7c3aed" }}
        />
      </div>
    );
  }

  if (!course) return null;

  const totalMaterials = course.modules.reduce((s, m) => s + m.materials.length, 0);
  const progress = totalMaterials > 0 ? Math.round((completedIds.length / totalMaterials) * 100) : 0;

  return (
    <div className="max-w-4xl">
      <Link
        href="/courses"
        className="flex items-center gap-1 text-sm mb-6 transition-colors"
        style={{ color: "#64748b" }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Kembali ke Daftar Kursus
      </Link>

      <div style={cardStyle} className="p-8 mb-5">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <span
                className="px-3 py-1 rounded-lg text-xs font-semibold"
                style={{
                  background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.1))",
                  color: "#a855f7",
                  border: "1px solid rgba(124,58,237,0.2)",
                }}
              >
                {course.semester}
              </span>
            </div>
            <h1
              className="text-2xl font-bold mb-3"
              style={{
                background: "linear-gradient(135deg, #f1f5f9, #a855f7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {course.title}
            </h1>
            <p className="mb-5" style={{ color: "#94a3b8" }}>{course.description}</p>
            <div className="flex flex-wrap items-center gap-5 text-sm" style={{ color: "#64748b" }}>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {course.instructor.name}
              </span>
              <span>{course._count.enrollments} mahasiswa</span>
              <span>{course.modules.length} modul</span>
            </div>
          </div>

          {session?.user?.role === "MAHASISWA" && (
            <div className="flex-shrink-0">
              {isEnrolled ? (
                <div className="text-center">
                  <div className="relative w-24 h-24 mx-auto">
                    <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="url(#circleGrad)"
                        strokeWidth="3"
                        strokeDasharray={`${progress}, 100`}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="circleGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#a855f7" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span
                        className="text-lg font-bold"
                        style={{ color: "#a855f7" }}
                      >
                        {progress}%
                      </span>
                    </div>
                  </div>
                  <p className="text-xs mt-2" style={{ color: "#64748b" }}>Progress Anda</p>
                </div>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrollLoading}
                  className="gradient-btn px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
                >
                  {enrollLoading ? "Mendaftar..." : "Daftar Kursus"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {isEnrolled && totalMaterials > 0 && (
        <div
          className="rounded-2xl p-5 mb-5"
          style={{
            background: "rgba(124,58,237,0.08)",
            border: "1px solid rgba(124,58,237,0.2)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium" style={{ color: "#f1f5f9" }}>Progress Belajar</span>
            <span className="text-sm" style={{ color: "#a855f7" }}>
              {completedIds.length}/{totalMaterials} materi selesai
            </span>
          </div>
          <div
            className="rounded-full h-2"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <div
              className="h-full rounded-full progress-glow"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div style={cardStyle} className="p-6">
        <h2 className="text-lg font-semibold mb-5" style={{ color: "#f1f5f9" }}>Konten Kursus</h2>
        {!isEnrolled && session?.user?.role === "MAHASISWA" && (
          <div
            className="rounded-xl p-4 mb-5 text-sm"
            style={{
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.2)",
              color: "#fbbf24",
            }}
          >
            Daftar ke kursus ini untuk mengakses semua materi dan melacak progress Anda.
          </div>
        )}
        <MaterialList
          modules={course.modules}
          completedMaterialIds={completedIds}
          onMarkComplete={isEnrolled ? handleMarkComplete : undefined}
          isEnrolled={isEnrolled}
        />
      </div>
    </div>
  );
}
