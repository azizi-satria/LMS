"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

interface Thread {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  user: { name: string; role: string };
  _count: { replies: number };
}

export default function ForumPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });
  const [saving, setSaving] = useState(false);

  const load = () => {
    fetch(`/api/forum?courseId=${courseId}`)
      .then((r) => r.json())
      .then((data) => { setThreads(Array.isArray(data) ? data : []); setLoading(false); });
  };

  useEffect(() => { load(); }, [courseId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/forum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, ...form }),
    });
    setSaving(false);
    setShowCreate(false);
    setForm({ title: "", content: "" });
    load();
  };

  const roleBadge = (role: string) => {
    const map: Record<string, { label: string; color: string }> = {
      DOSEN: { label: "Dosen", color: "#6366f1" },
      ADMIN: { label: "Admin", color: "#ef4444" },
      MAHASISWA: { label: "Mahasiswa", color: "#10b981" },
      UMUM: { label: "Umum", color: "#f59e0b" },
    };
    return map[role] || { label: role, color: "#6b7280" };
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <button onClick={() => router.push(`/courses/${courseId}`)} style={{ background: "none", border: "none", color: "var(--accent-primary)", cursor: "pointer", marginBottom: 8, padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
            ← Kembali ke Kursus
          </button>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Forum Diskusi</h1>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ background: "var(--accent-primary)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 600, cursor: "pointer" }}>
          + Buat Thread
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-secondary)" }}>Memuat...</div>
      ) : threads.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 12 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
          <p style={{ color: "var(--text-secondary)" }}>Belum ada diskusi. Jadilah yang pertama memulai!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {threads.map((t) => {
            const rb = roleBadge(t.user.role);
            return (
              <div key={t.id} onClick={() => router.push(`/courses/${courseId}/forum/${t.id}`)} style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 20, cursor: "pointer", transition: "border-color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent-primary)")} onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-color)")}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  {t.isPinned && <span style={{ fontSize: 16, flexShrink: 0 }}>📌</span>}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>{t.title}</h3>
                    <p style={{ margin: "0 0 12px", fontSize: 14, color: "var(--text-secondary)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{t.content}</p>
                    <div style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 13, color: "var(--text-secondary)" }}>
                      <span style={{ background: rb.color + "22", color: rb.color, padding: "2px 8px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{rb.label}</span>
                      <span>{t.user.name}</span>
                      <span>•</span>
                      <span>{new Date(t.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                      <span>•</span>
                      <span>💬 {t._count.replies} balasan</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 }}>
          <div style={{ background: "var(--card-bg)", borderRadius: 16, padding: 28, width: "100%", maxWidth: 540 }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>Buat Thread Baru</h2>
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Judul</label>
                <input required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Judul diskusi..." style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Isi Diskusi</label>
                <textarea required value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} rows={5} placeholder="Tulis pertanyaan atau topik diskusi..." style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, resize: "vertical", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowCreate(false)} style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid var(--border-color)", background: "none", color: "var(--text-secondary)", cursor: "pointer" }}>Batal</button>
                <button type="submit" disabled={saving} style={{ padding: "10px 24px", borderRadius: 8, background: "var(--accent-primary)", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
                  {saving ? "Mengirim..." : "Posting"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
