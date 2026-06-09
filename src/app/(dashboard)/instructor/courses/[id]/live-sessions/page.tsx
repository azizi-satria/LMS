"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface LiveSession {
  id: string;
  title: string;
  description?: string;
  zoomLink: string;
  startAt: string;
  endAt: string;
}

export default function LiveSessionsPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", zoomLink: "", startAt: "", endAt: "" });
  const [saving, setSaving] = useState(false);

  const load = () => {
    fetch(`/api/live-sessions?courseId=${courseId}`)
      .then((r) => r.json())
      .then((data) => { setSessions(Array.isArray(data) ? data : []); setLoading(false); });
  };

  useEffect(() => { load(); }, [courseId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/live-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, ...form }),
    });
    setSaving(false);
    setShowModal(false);
    setForm({ title: "", description: "", zoomLink: "", startAt: "", endAt: "" });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus sesi ini?")) return;
    await fetch(`/api/live-sessions/${id}`, { method: "DELETE" });
    load();
  };

  const formatDate = (str: string) =>
    new Date(str).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div style={{ padding: "32px 24px", maxWidth: 800 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Sesi Live</h1>
          <p style={{ color: "var(--text-secondary)", margin: "4px 0 0" }}>Jadwal Zoom / pertemuan online</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ background: "var(--accent-primary)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 600, cursor: "pointer" }}>
          + Tambah Sesi
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-secondary)" }}>Memuat...</div>
      ) : sessions.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 12 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📹</div>
          <p style={{ color: "var(--text-secondary)" }}>Belum ada sesi live. Tambahkan jadwal Zoom pertama.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {sessions.map((s) => {
            const isPast = new Date(s.endAt) < new Date();
            const isLive = new Date(s.startAt) <= new Date() && new Date(s.endAt) >= new Date();
            return (
              <div key={s.id} style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>{s.title}</h3>
                      {isLive && <span style={{ background: "#ef444422", color: "#ef4444", padding: "2px 8px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>🔴 LIVE</span>}
                      {isPast && !isLive && <span style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)", padding: "2px 8px", borderRadius: 20, fontSize: 12 }}>Selesai</span>}
                    </div>
                    {s.description && <p style={{ margin: "0 0 10px", fontSize: 14, color: "var(--text-secondary)" }}>{s.description}</p>}
                    <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--text-secondary)" }}>
                      <span>🕐 {formatDate(s.startAt)} – {formatDate(s.endAt)}</span>
                    </div>
                    <a href={s.zoomLink} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10, color: "var(--accent-primary)", fontSize: 13, fontWeight: 500 }}>
                      🔗 {s.zoomLink.length > 50 ? s.zoomLink.slice(0, 50) + "..." : s.zoomLink}
                    </a>
                  </div>
                  <button onClick={() => handleDelete(s.id)} style={{ background: "#ef444422", color: "#ef4444", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 13, marginLeft: 12 }}>
                    Hapus
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 }}>
          <div style={{ background: "var(--card-bg)", borderRadius: 16, padding: 28, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>Tambah Sesi Live</h2>
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { label: "Judul Sesi", key: "title", type: "text", required: true },
                { label: "Link Zoom", key: "zoomLink", type: "url", required: true },
                { label: "Deskripsi (opsional)", key: "description", type: "text", required: false },
              ].map((f) => (
                <div key={f.key}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>{f.label}</label>
                  <input
                    type={f.type}
                    required={f.required}
                    value={(form as any)[f.key]}
                    onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, boxSizing: "border-box" }}
                  />
                </div>
              ))}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[{ label: "Mulai", key: "startAt" }, { label: "Selesai", key: "endAt" }].map((f) => (
                  <div key={f.key}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>{f.label}</label>
                    <input
                      type="datetime-local"
                      required
                      value={(form as any)[f.key]}
                      onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, boxSizing: "border-box" }}
                    />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid var(--border-color)", background: "none", color: "var(--text-secondary)", cursor: "pointer" }}>Batal</button>
                <button type="submit" disabled={saving} style={{ padding: "10px 24px", borderRadius: 8, background: "var(--accent-primary)", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
