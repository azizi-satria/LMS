"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Material {
  id: string;
  title: string;
  type: "VIDEO" | "PDF" | "DOCUMENT" | "LINK";
  contentUrl: string;
  order: number;
}

interface Module {
  id: string;
  title: string;
  order: number;
  materials: Material[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  semester: string;
  visibility: "DRAFT" | "INTERNAL" | "PUBLIC";
  price: number;
  isApproved: boolean;
  modules: Module[];
}

const materialTypes = ["VIDEO", "PDF", "DOCUMENT", "LINK"] as const;
const materialTypeLabels = { VIDEO: "Video", PDF: "PDF", DOCUMENT: "Dokumen", LINK: "Tautan" };

const inputStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#f1f5f9",
  borderRadius: "12px",
  padding: "12px 16px",
  fontSize: "14px",
  width: "100%",
  outline: "none",
};

const cardStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid #1e1e2e",
  borderRadius: "16px",
};

const materialTypeStyles: Record<string, { bg: string; color: string }> = {
  VIDEO: { bg: "rgba(239,68,68,0.12)", color: "#f87171" },
  PDF: { bg: "rgba(249,115,22,0.12)", color: "#fb923c" },
  DOCUMENT: { bg: "rgba(59,130,246,0.12)", color: "#60a5fa" },
  LINK: { bg: "rgba(16,185,129,0.12)", color: "#34d399" },
};

const visibilityInfo = {
  DRAFT: { label: "Draft", color: "#64748b", bg: "rgba(100,116,139,0.15)" },
  INTERNAL: { label: "Internal (Mahasiswa)", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  PUBLIC: { label: "Publik", color: "#22c55e", bg: "rgba(34,197,94,0.15)" },
};

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "modules" | "publish">("info");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    semester: "",
    visibility: "DRAFT" as "DRAFT" | "INTERNAL",
  });

  const [publishForm, setPublishForm] = useState({ suggestedPrice: 0, requesterNotes: "" });
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [publishError, setPublishError] = useState("");

  const [newModule, setNewModule] = useState({ title: "" });
  const [addingModule, setAddingModule] = useState(false);

  const [newMaterial, setNewMaterial] = useState<{
    moduleId: string;
    title: string;
    type: "VIDEO" | "PDF" | "DOCUMENT" | "LINK";
    contentUrl: string;
  } | null>(null);
  const [addingMaterial, setAddingMaterial] = useState(false);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await fetch(`/api/courses/${params.id}`);
        if (!res.ok) { router.push("/instructor/courses"); return; }
        const data = await res.json();
        setCourse(data.course);
        setCourseForm({
          title: data.course.title,
          description: data.course.description,
          semester: data.course.semester,
          visibility: data.course.visibility === "PUBLIC" ? "INTERNAL" : data.course.visibility,
        });
        setPublishForm({ suggestedPrice: data.course.price || 0, requesterNotes: "" });
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, [params.id, router]);

  async function handleSaveCourse(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/courses/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseForm),
      });
      if (res.ok) {
        const data = await res.json();
        setCourse((prev) => prev ? { ...prev, ...data } : null);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleRequestPublish(e: React.FormEvent) {
    e.preventDefault();
    setPublishLoading(true);
    setPublishError("");
    try {
      const res = await fetch(`/api/courses/${params.id}/request-publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(publishForm),
      });
      const data = await res.json();
      if (res.ok) {
        setPublishSuccess(true);
      } else {
        setPublishError(data.error || "Gagal mengirim permintaan.");
      }
    } finally {
      setPublishLoading(false);
    }
  }

  async function handleAddModule(e: React.FormEvent) {
    e.preventDefault();
    setAddingModule(true);
    try {
      const res = await fetch("/api/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: params.id,
          title: newModule.title,
          order: (course?.modules.length || 0) + 1,
        }),
      });
      if (res.ok) {
        const mod = await res.json();
        setCourse((prev) => prev ? { ...prev, modules: [...prev.modules, { ...mod, materials: [] }] } : null);
        setNewModule({ title: "" });
      }
    } finally {
      setAddingModule(false);
    }
  }

  async function handleAddMaterial(e: React.FormEvent) {
    e.preventDefault();
    if (!newMaterial) return;
    setAddingMaterial(true);
    try {
      const moduleObj = course?.modules.find((m) => m.id === newMaterial.moduleId);
      const res = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newMaterial, order: (moduleObj?.materials.length || 0) + 1 }),
      });
      if (res.ok) {
        const mat = await res.json();
        setCourse((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            modules: prev.modules.map((m) =>
              m.id === newMaterial.moduleId ? { ...m, materials: [...m.materials, mat] } : m
            ),
          };
        });
        setNewMaterial(null);
      }
    } finally {
      setAddingMaterial(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: "#7c3aed" }} />
      </div>
    );
  }

  if (!course) return null;

  const vis = visibilityInfo[course.visibility];
  const semesters = [
    "Semester Ganjil 2024/2025",
    "Semester Genap 2024/2025",
    "Semester Ganjil 2025/2026",
    "Semester Genap 2025/2026",
  ];

  return (
    <div className="max-w-4xl">
      <Link href="/instructor/courses" className="flex items-center gap-1 text-sm mb-6 transition-colors" style={{ color: "#64748b" }}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Kembali ke Daftar Kursus
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#f1f5f9" }}>Edit Kursus</h1>
          <p className="mt-1" style={{ color: "#64748b" }}>{course.title}</p>
        </div>
        <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: vis.bg, color: vis.color }}>
          {vis.label}
        </span>
      </div>

      <div className="flex mb-6 rounded-xl p-1" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #1e1e2e" }}>
        {(["info", "modules", "publish"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all"
            style={activeTab === tab ? { background: "linear-gradient(135deg, #7c3aed, #06b6d4)", color: "white" } : { color: "#64748b" }}>
            {tab === "info" ? "Informasi" : tab === "modules" ? `Modul (${course.modules.length})` : "Publikasi"}
          </button>
        ))}
      </div>

      {activeTab === "info" && (
        <div style={cardStyle} className="p-8">
          <form onSubmit={handleSaveCourse} className="space-y-6">
            {saveSuccess && (
              <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399" }}>
                Perubahan berhasil disimpan!
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#cbd5e1" }}>Judul Kursus</label>
              <input type="text" value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} required style={inputStyle} className="dark-input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#cbd5e1" }}>Deskripsi</label>
              <textarea value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} required rows={4} style={{ ...inputStyle, resize: "none" }} className="dark-input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#cbd5e1" }}>Semester</label>
              <select value={courseForm.semester} onChange={(e) => setCourseForm({ ...courseForm, semester: e.target.value })} required style={{ ...inputStyle, background: "#111118" }} className="dark-input">
                {semesters.map((s) => <option key={s} value={s} style={{ background: "#111118" }}>{s}</option>)}
              </select>
            </div>
            {course.visibility !== "PUBLIC" && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#cbd5e1" }}>Visibilitas</label>
                <select value={courseForm.visibility} onChange={(e) => setCourseForm({ ...courseForm, visibility: e.target.value as "DRAFT" | "INTERNAL" })} style={{ ...inputStyle, background: "#111118" }} className="dark-input">
                  <option value="DRAFT" style={{ background: "#111118" }}>Draft — hanya terlihat oleh Anda</option>
                  <option value="INTERNAL" style={{ background: "#111118" }}>Internal — terlihat oleh mahasiswa terdaftar</option>
                </select>
                <p className="text-xs mt-1" style={{ color: "#64748b" }}>Untuk publik, gunakan tab Publikasi dan minta persetujuan admin.</p>
              </div>
            )}
            <button type="submit" disabled={saving} className="gradient-btn py-3 px-6 rounded-xl font-semibold disabled:opacity-50">
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </form>
        </div>
      )}

      {activeTab === "modules" && (
        <div className="space-y-4">
          {course.modules.map((module) => (
            <div key={module.id} style={cardStyle} className="overflow-hidden">
              <div className="px-6 py-4 flex items-center justify-between" style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid #1e1e2e" }}>
                <h3 className="font-semibold" style={{ color: "#f1f5f9" }}>{module.title}</h3>
                <span className="text-sm" style={{ color: "#64748b" }}>{module.materials.length} materi</span>
              </div>
              <div>
                {module.materials.map((material, idx) => {
                  const ts = materialTypeStyles[material.type];
                  return (
                    <div key={material.id} className="px-6 py-3 flex items-center gap-3" style={{ borderTop: idx > 0 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                      <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: ts.bg, color: ts.color }}>{materialTypeLabels[material.type]}</span>
                      <span className="text-sm flex-1" style={{ color: "#e2e8f0" }}>{material.title}</span>
                      <a href={material.contentUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium" style={{ color: "#a855f7" }}>Lihat</a>
                    </div>
                  );
                })}
                {newMaterial?.moduleId === module.id ? (
                  <form onSubmit={handleAddMaterial} className="px-6 py-4 space-y-3" style={{ borderTop: "1px solid rgba(255,255,255,0.04)", background: "rgba(124,58,237,0.05)" }}>
                    <p className="text-sm font-medium" style={{ color: "#f1f5f9" }}>Tambah Materi</p>
                    <input type="text" value={newMaterial.title} onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })} required placeholder="Judul materi" style={inputStyle} className="dark-input" />
                    <select value={newMaterial.type} onChange={(e) => setNewMaterial({ ...newMaterial, type: e.target.value as "VIDEO" | "PDF" | "DOCUMENT" | "LINK" })} style={{ ...inputStyle, background: "#111118" }} className="dark-input">
                      {materialTypes.map((t) => <option key={t} value={t} style={{ background: "#111118" }}>{materialTypeLabels[t]}</option>)}
                    </select>
                    <input type="url" value={newMaterial.contentUrl} onChange={(e) => setNewMaterial({ ...newMaterial, contentUrl: e.target.value })} required placeholder="URL konten (https://...)" style={inputStyle} className="dark-input" />
                    <div className="flex gap-2">
                      <button type="submit" disabled={addingMaterial} className="gradient-btn px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50">{addingMaterial ? "Menambahkan..." : "Tambah"}</button>
                      <button type="button" onClick={() => setNewMaterial(null)} className="px-4 py-2 rounded-xl text-sm font-medium" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8" }}>Batal</button>
                    </div>
                  </form>
                ) : (
                  <button onClick={() => setNewMaterial({ moduleId: module.id, title: "", type: "VIDEO", contentUrl: "" })} className="w-full px-6 py-3 text-sm text-left flex items-center gap-2 transition-all" style={{ color: "#a855f7", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Tambah Materi
                  </button>
                )}
              </div>
            </div>
          ))}
          <div style={cardStyle} className="p-6">
            <h3 className="font-semibold mb-4" style={{ color: "#f1f5f9" }}>Tambah Modul Baru</h3>
            <form onSubmit={handleAddModule} className="flex gap-3">
              <input type="text" value={newModule.title} onChange={(e) => setNewModule({ title: e.target.value })} required placeholder="Judul modul baru" style={{ ...inputStyle, flex: 1 }} className="dark-input" />
              <button type="submit" disabled={addingModule} className="gradient-btn px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 whitespace-nowrap">
                {addingModule ? "Menambahkan..." : "Tambah Modul"}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === "publish" && (
        <div style={cardStyle} className="p-8">
          <h2 className="text-lg font-bold mb-2" style={{ color: "#f1f5f9" }}>Permintaan Publikasi Publik</h2>
          <p className="text-sm mb-6" style={{ color: "#64748b" }}>
            Kursus dengan visibilitas <strong style={{ color: "#f59e0b" }}>PUBLIC</strong> dapat diakses oleh siapa saja termasuk non-mahasiswa. Permintaan akan ditinjau admin.
          </p>
          {course.visibility === "PUBLIC" ? (
            <div className="px-4 py-3 rounded-xl" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e" }}>
              ✓ Kursus ini sudah dipublikasikan secara publik.
            </div>
          ) : publishSuccess ? (
            <div className="px-4 py-3 rounded-xl" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e" }}>
              ✓ Permintaan publikasi berhasil dikirim. Tunggu persetujuan admin.
            </div>
          ) : (
            <form onSubmit={handleRequestPublish} className="space-y-5">
              {publishError && (
                <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>{publishError}</div>
              )}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#cbd5e1" }}>Harga yang Diusulkan (Rp) — isi 0 untuk gratis</label>
                <input type="number" value={publishForm.suggestedPrice} onChange={(e) => setPublishForm({ ...publishForm, suggestedPrice: parseInt(e.target.value) || 0 })} min={0} style={inputStyle} className="dark-input" />
                <p className="text-xs mt-1" style={{ color: "#64748b" }}>Admin dapat mengubah harga saat menyetujui.</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#cbd5e1" }}>Catatan untuk Admin (opsional)</label>
                <textarea value={publishForm.requesterNotes} onChange={(e) => setPublishForm({ ...publishForm, requesterNotes: e.target.value })} rows={3} placeholder="Jelaskan tujuan atau alasan publikasi..." style={{ ...inputStyle, resize: "none" }} className="dark-input" />
              </div>
              <button type="submit" disabled={publishLoading} className="gradient-btn py-3 px-6 rounded-xl font-semibold disabled:opacity-50">
                {publishLoading ? "Mengirim..." : "Kirim Permintaan Publikasi"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
