"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const semesters = ["Semester Ganjil 2024/2025", "Semester Genap 2024/2025", "Semester Ganjil 2025/2026", "Semester Genap 2025/2026"];

export default function NewCoursePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ title: "", description: "", semester: "", isPublished: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/courses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Terjadi kesalahan."); setLoading(false); return; }
      router.push(`/instructor/courses/${data.id}/edit`);
    } catch { setError("Terjadi kesalahan jaringan."); setLoading(false); }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/instructor/courses" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4">← Kembali ke Daftar Kursus</Link>
        <h1 className="text-2xl font-bold text-gray-900">Buat Kursus Baru</h1>
        <p className="text-gray-500 mt-1">Isi informasi dasar kursus Anda</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Judul Kursus <span className="text-red-500">*</span></label>
            <input name="title" type="text" value={formData.title} onChange={handleChange} required placeholder="Contoh: Pemrograman Web Dasar" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi <span className="text-red-500">*</span></label>
            <textarea name="description" value={formData.description} onChange={handleChange} required rows={4} placeholder="Jelaskan isi dan tujuan kursus ini..." className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Semester <span className="text-red-500">*</span></label>
            <select name="semester" value={formData.semester} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">Pilih Semester</option>
              {semesters.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" name="isPublished" id="isPublished" checked={formData.isPublished} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
            <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">Publikasikan kursus segera</label>
          </div>
          <div className="flex gap-4 pt-2">
            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
              {loading ? "Membuat..." : "Buat Kursus"}
            </button>
            <Link href="/instructor/courses" className="flex-1 text-center bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200">Batal</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
