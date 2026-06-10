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

function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 100, padding: "12px 20px", borderRadius: 12, background: ok ? "#10b981" : "#ef4444", color: "#fff", fontWeight: 600, fontSize: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
      {ok ? "✓ " : "✗ "}{msg}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid var(--border-color)",
  background: "var(--bg-secondary)",
  color: "var(--text-primary)",
  fontSize: 14,
  boxSizing: "border-box" as const,
};

export default function LiveSessionsPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", zoomLink: "", startAt: "", endAt: "" });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const load = () => {
    fetch(`/api/live-sessions?courseId=${courseId}`)
      .then((r) => r.json())
      .then((data) => { setSessions(Array.isArray(data) ? data : []); setLoading(false); });
  };

  useEffect(() => { load(); }, [courseId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/live-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, ...form }),
    });
    if (res.ok) {
      setShowModal(false);
      setForm({ title: "", description: "", zoomLink: "", startAt: "", endAt: "" });
      load();
      showToast("Sesi live berhasil ditambahkan!", true);
    } else {
      const err = await res.json();
      showToast(err.error || "Gagal menyimpan sesi.", false);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus sesi ini?")) return;
    const res = await fetch(`/api/live-sessions/${id}`, { method: "DELETE" });
    if (res.ok) { load(); showToast("Sesi dihapus.", true); }
    else showToast("Gagal menghapus sesi.", false);
  };

  const formatDate = (str: string) =>
    new Date(str).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div style={{ padding: "32px 24px", maxWidth: 800 }}>
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}

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
          <p style={{ color: "var(--text-secondary)", marginBottom: 16 }}>Belum ada sesi live. Tambahkan jadwal pertama.</p>
          <button onClick={() => setShowModal(true)} style={{ background: "var(--accent-primary)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontWeight: 600, cursor: "pointer" }}>
            + Tambah Sesi
          </button>
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
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>
                      🕐 {formatDate(s.startAt)} — {formatDate(s.endAt)}
                    </div>
                    <a href={s.zoomLink} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--accent-primary)", fontSize: 13, fontWeight: 500, wordBreak: "break-all" }}>
                      🔗 {s.zoomLink}
                    </a>
                  </div>
                  <button onClick={() => handleDelete(s.id)} style={{ background: "#ef444422", color: "#ef4444", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 13, marginLeft: 12, flexShrink: 0 }}>
                    Hapus
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 }}>
          <div style={{ background: "var(--card-bg)", borderRadius: 16, padding: 28, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>Tambah Sesi Live</h2>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--text-secondary)" }}>Isi detail jadwal dan link Zoom/Google Meet.</p>
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Judul Sesi *</label>
                <input type="text" required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Contoh: Sesi 1 — Pengenalan Materi" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Link Zoom / Google Meet *</label>
                <input type="url" required value={form.zoomLink} onChange={(e) => setForm((p) => ({ ...p, zoomLink: e.target.value }))} placeholder="https://zoom.us/j/..." style={inputStyle} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Deskripsi (opsional)</label>
                <input type="text" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Topik yang akan dibahas..." style={inputStyle} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Mulai *</label>
                  <input type="datetime-local" required value={form.startAt} onChange={(e) => setForm((p) => ({ ...p, startAt: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Selesai *</label>
                  <input type="datetime-local" required value={form.endAt} onChange={(e) => setForm((p) => ({ ...p, endAt: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid var(--border-color)", background: "none", color: "var(--text-secondary)", cursor: "pointer" }}>Batal</button>
                <button type="submit" disabled={saving} style={{ padding: "10px 24px", borderRadius: 8, background: "var(--accent-primary)", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
                  {saving ? "Menyimpan..." : "Simpan Sesi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
