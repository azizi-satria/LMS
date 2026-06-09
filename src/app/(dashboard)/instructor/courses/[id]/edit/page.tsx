"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type MaterialType = "VIDEO" | "PDF" | "DOCUMENT" | "LINK";
const materialTypes: MaterialType[] = ["VIDEO", "PDF", "DOCUMENT", "LINK"];
const materialTypeLabels: Record<MaterialType, string> = { VIDEO: "Video", PDF: "PDF", DOCUMENT: "Dokumen", LINK: "Tautan" };
const semesters = ["Semester Ganjil 2024/2025", "Semester Genap 2024/2025", "Semester Ganjil 2025/2026", "Semester Genap 2025/2026"];

interface Material { id: string; title: string; type: MaterialType; contentUrl: string; order: number; }
interface Module { id: string; title: string; order: number; materials: Material[]; }
interface Course { id: string; title: string; description: string; semester: string; isPublished: boolean; modules: Module[]; }

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "modules">("info");
  const [courseForm, setCourseForm] = useState({ title: "", description: "", semester: "", isPublished: false });
  const [newModule, setNewModule] = useState({ title: "" });
  const [addingModule, setAddingModule] = useState(false);
  const [newMaterial, setNewMaterial] = useState<{ moduleId: string; title: string; type: MaterialType; contentUrl: string } | null>(null);
  const [addingMaterial, setAddingMaterial] = useState(false);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await fetch(`/api/courses/${params.id}`);
        if (!res.ok) { router.push("/instructor/courses"); return; }
        const data = await res.json();
        setCourse(data.course);
        setCourseForm({ title: data.course.title, description: data.course.description, semester: data.course.semester, isPublished: data.course.isPublished });
      } finally { setLoading(false); }
    }
    fetchCourse();
  }, [params.id, router]);

  async function handleSaveCourse(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try {
      const res = await fetch(`/api/courses/${params.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(courseForm) });
      if (res.ok) { const data = await res.json(); setCourse((prev) => prev ? { ...prev, ...data } : null); }
    } finally { setSaving(false); }
  }

  async function handleAddModule(e: React.FormEvent) {
    e.preventDefault(); setAddingModule(true);
    try {
      const res = await fetch("/api/modules", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseId: params.id, title: newModule.title, order: (course?.modules.length || 0) + 1 }) });
      if (res.ok) { const mod = await res.json(); setCourse((prev) => prev ? { ...prev, modules: [...prev.modules, { ...mod, materials: [] }] } : null); setNewModule({ title: "" }); }
    } finally { setAddingModule(false); }
  }

  async function handleAddMaterial(e: React.FormEvent) {
    e.preventDefault(); if (!newMaterial) return; setAddingMaterial(true);
    try {
      const moduleObj = course?.modules.find((m) => m.id === newMaterial.moduleId);
      const res = await fetch("/api/materials", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...newMaterial, order: (moduleObj?.materials.length || 0) + 1 }) });
      if (res.ok) {
        const mat = await res.json();
        setCourse((prev) => prev ? { ...prev, modules: prev.modules.map((m) => m.id === newMaterial.moduleId ? { ...m, materials: [...m.materials, mat] } : m) } : null);
        setNewMaterial(null);
      }
    } finally { setAddingMaterial(false); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;
  if (!course) return null;

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/instructor/courses" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4">← Kembali ke Daftar Kursus</Link>
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-gray-900">Edit Kursus</h1><p className="text-gray-500 mt-1">{course.title}</p></div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${ course.isPublished ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700" }`}>{course.isPublished ? "Dipublikasikan" : "Draft"}</span>
        </div>
      </div>
      <div className="flex border-b border-gray-200 mb-6">
        {(["info", "modules"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${ activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700" }`}>
            {tab === "info" ? "Informasi Kursus" : `Modul & Materi (${course.modules.length})`}
          </button>
        ))}
      </div>
      {activeTab === "info" && (
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <form onSubmit={handleSaveCourse} className="space-y-6">
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Judul Kursus</label><input type="text" value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} required className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label><textarea value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} required rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Semester</label>
              <select value={courseForm.semester} onChange={(e) => setCourseForm({ ...courseForm, semester: e.target.value })} required className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {semesters.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="isPublished" checked={courseForm.isPublished} onChange={(e) => setCourseForm({ ...courseForm, isPublished: e.target.checked })} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
              <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">Publikasikan kursus</label>
            </div>
            <button type="submit" disabled={saving} className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">{saving ? "Menyimpan..." : "Simpan Perubahan"}</button>
          </form>
        </div>
      )}
      {activeTab === "modules" && (
        <div className="space-y-4">
          {course.modules.map((module) => (
            <div key={module.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{module.title}</h3>
                <span className="text-sm text-gray-500">{module.materials.length} materi</span>
              </div>
              <div className="divide-y divide-gray-100">
                {module.materials.map((material) => (
                  <div key={material.id} className="px-6 py-3 flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${ material.type === "VIDEO" ? "bg-red-100 text-red-700" : material.type === "PDF" ? "bg-orange-100 text-orange-700" : material.type === "DOCUMENT" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700" }`}>
                      {materialTypeLabels[material.type]}
                    </span>
                    <span className="text-sm text-gray-700 flex-1">{material.title}</span>
                    <a href={material.contentUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-700">Lihat</a>
                  </div>
                ))}
                {newMaterial?.moduleId === module.id ? (
                  <form onSubmit={handleAddMaterial} className="px-6 py-4 space-y-3 bg-blue-50">
                    <p className="text-sm font-medium text-gray-700">Tambah Materi</p>
                    <input type="text" value={newMaterial.title} onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })} required placeholder="Judul materi" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <select value={newMaterial.type} onChange={(e) => setNewMaterial({ ...newMaterial, type: e.target.value as MaterialType })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      {materialTypes.map((t) => <option key={t} value={t}>{materialTypeLabels[t]}</option>)}
                    </select>
                    <input type="url" value={newMaterial.contentUrl} onChange={(e) => setNewMaterial({ ...newMaterial, contentUrl: e.target.value })} required placeholder="URL konten (https://...)" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <div className="flex gap-2">
                      <button type="submit" disabled={addingMaterial} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">{addingMaterial ? "Menambahkan..." : "Tambah"}</button>
                      <button type="button" onClick={() => setNewMaterial(null)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">Batal</button>
                    </div>
                  </form>
                ) : (
                  <button onClick={() => setNewMaterial({ moduleId: module.id, title: "", type: "VIDEO", contentUrl: "" })} className="w-full px-6 py-3 text-sm text-blue-600 hover:bg-blue-50 text-left">+ Tambah Materi</button>
                )}
              </div>
            </div>
          ))}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Tambah Modul Baru</h3>
            <form onSubmit={handleAddModule} className="flex gap-3">
              <input type="text" value={newModule.title} onChange={(e) => setNewModule({ title: e.target.value })} required placeholder="Judul modul baru" className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button type="submit" disabled={addingModule} className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">{addingModule ? "Menambahkan..." : "Tambah Modul"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
