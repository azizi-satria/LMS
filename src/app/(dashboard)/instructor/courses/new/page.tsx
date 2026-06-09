"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const inputStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#f1f5f9",
  borderRadius: "12px",
  padding: "12px 16px",
  fontSize: "14px",
  width: "100%",
  outline: "none",
  transition: "all 0.2s ease",
};

export default function NewCoursePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    semester: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Terjadi kesalahan.");
        setLoading(false);
        return;
      }

      router.push(`/instructor/courses/${data.id}/edit`);
    } catch {
      setError("Terjadi kesalahan jaringan.");
      setLoading(false);
    }
  }

  const semesters = [
    "Semester Ganjil 2024/2025",
    "Semester Genap 2024/2025",
    "Semester Ganjil 2025/2026",
    "Semester Genap 2025/2026",
  ];

  return (
    <div className="max-w-2xl">
      <Link
        href="/instructor/courses"
        className="flex items-center gap-1 text-sm mb-6 transition-colors"
        style={{ color: "#64748b" }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Kembali ke Daftar Kursus
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#f1f5f9" }}>Buat Kursus Baru</h1>
        <p className="mt-1" style={{ color: "#64748b" }}>Isi informasi dasar kursus Anda</p>
      </div>

      <div
        className="rounded-2xl p-8"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #1e1e2e" }}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div
              className="px-4 py-3 rounded-xl text-sm"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#fca5a5",
              }}
            >
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#cbd5e1" }}>
              Judul Kursus <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Contoh: Pemrograman Web Dasar"
              style={inputStyle}
              className="dark-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#cbd5e1" }}>
              Deskripsi <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Jelaskan isi dan tujuan kursus ini..."
              style={{ ...inputStyle, resize: "none" }}
              className="dark-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#cbd5e1" }}>
              Semester <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <select
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              required
              style={{ ...inputStyle, background: "#111118" }}
              className="dark-input"
            >
              <option value="" style={{ background: "#111118" }}>Pilih Semester</option>
              {semesters.map((s) => (
                <option key={s} value={s} style={{ background: "#111118" }}>{s}</option>
              ))}
            </select>
          </div>

          <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", color: "#a855f7" }}>
            Kursus baru akan dibuat sebagai <strong>Draft</strong>. Anda dapat mengubah visibilitas setelah membuat kursus.
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 gradient-btn py-3 px-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Membuat..." : "Buat Kursus"}
            </button>
            <Link
              href="/instructor/courses"
              className="flex-1 text-center py-3 px-4 rounded-xl font-semibold transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#94a3b8",
              }}
            >
              Batal
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
