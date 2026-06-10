"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 100, padding: "12px 20px", borderRadius: 12, background: ok ? "#10b981" : "#ef4444", color: "#fff", fontWeight: 600, fontSize: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
      {ok ? "✓ " : "✗ "}{msg}
    </div>
  );
}

interface Module { id: string; title: string; }
interface Submission { userId: string; content: string; fileUrl?: string; score?: number; feedback?: string; status: string; submittedAt: string; user: { name: string }; }
interface Assignment { id: string; title: string; description: string; deadline?: string; maxScore: number; module: { title: string }; submissions?: Submission[]; }

export default function AssignmentsPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [modules, setModules] = useState<Module[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [grading, setGrading] = useState<{ assignmentId: string; userId: string; name: string } | null>(null);
  const [gradeForm, setGradeForm] = useState({ score: "", feedback: "" });
  const [form, setForm] = useState({ moduleId: "", title: "", description: "", deadline: "", maxScore: "100" });
  const [expanded, setExpanded] = useState<string | null>(null);
  const [submissionsMap, setSubmissionsMap] = useState<Record<string, Submission[]>>({});
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const showToast = (msg: string, ok: boolean) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    Promise.all([
      fetch(`/api/courses/${courseId}/modules`).then((r) => r.json()),
    ]).then(([mods]) => {
      setModules(Array.isArray(mods) ? mods : []);
      setLoading(false);
    });
    loadAssignments();
  }, [courseId]);

  const loadAssignments = () => {
    fetch(`/api/assignments?courseId=${courseId}`)
      .then((r) => r.json())
      .then((data) => setAssignments(Array.isArray(data) ? data : []));
  };

  const loadSubmissions = async (assignmentId: string) => {
    const res = await fetch(`/api/assignments/${assignmentId}/submissions`);
    const data = await res.json();
    setSubmissionsMap((p) => ({ ...p, [assignmentId]: Array.isArray(data) ? data : [] }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, maxScore: parseInt(form.maxScore), deadline: form.deadline || null }),
    });
    if (res.ok) {
      setShowCreate(false);
      setForm({ moduleId: "", title: "", description: "", deadline: "", maxScore: "100" });
      loadAssignments();
      showToast("Tugas berhasil dibuat!", true);
    } else {
      const err = await res.json();
      showToast(err.error || "Gagal membuat tugas.", false);
    }
  };

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grading) return;
    await fetch(`/api/assignments/${grading.assignmentId}/grade`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: grading.userId, score: parseInt(gradeForm.score), feedback: gradeForm.feedback }),
    });
    setGrading(null);
    setGradeForm({ score: "", feedback: "" });
    if (expanded) loadSubmissions(expanded);
  };

  const toggleExpand = (id: string) => {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    if (!submissionsMap[id]) loadSubmissions(id);
  };

  return (
    <div style={{ padding: "32px 24px", maxWidth: 900 }}>
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Tugas</h1>
          <p style={{ color: "var(--text-secondary)", margin: "4px 0 0" }}>Kelola tugas dan nilai pengumpulan</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ background: "var(--accent-primary)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 600, cursor: "pointer" }}>
          + Tambah Tugas
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-secondary)" }}>Memuat...</div>
      ) : assignments.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 12 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <p style={{ color: "var(--text-secondary)" }}>Belum ada tugas. Buat tugas pertama.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {assignments.map((a) => {
            const subs = submissionsMap[a.id] || [];
            const isOpen = expanded === a.id;
            return (
              <div key={a.id} style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ padding: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>{a.title}</h3>
                      <span style={{ fontSize: 12, color: "var(--text-secondary)", background: "var(--bg-secondary)", padding: "2px 8px", borderRadius: 20 }}>{a.module.title}</span>
                    </div>
                    <p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--text-secondary)" }}>{a.description}</p>
                    <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--text-secondary)" }}>
                      <span>Nilai maks: {a.maxScore}</span>
                      {a.deadline && <span>Deadline: {new Date(a.deadline).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</span>}
                    </div>
                  </div>
                  <button onClick={() => toggleExpand(a.id)} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: 8, padding: "8px 14px", cursor: "pointer", color: "var(--text-primary)", fontSize: 13, whiteSpace: "nowrap" }}>
                    {isOpen ? "Tutup" : "Lihat Pengumpulan"}
                  </button>
                </div>
                {isOpen && (
                  <div style={{ borderTop: "1px solid var(--border-color)", padding: 20 }}>
                    <h4 style={{ margin: "0 0 14px", fontSize: 15, color: "var(--text-primary)" }}>Pengumpulan ({subs.length})</h4>
                    {subs.length === 0 ? (
                      <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Belum ada yang mengumpulkan.</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {subs.map((sub) => (
                          <div key={sub.userId} style={{ background: "var(--bg-secondary)", borderRadius: 10, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                                <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 14 }}>{sub.user.name}</span>
                                <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 20, background: sub.status === "GRADED" ? "#10b98122" : "#f59e0b22", color: sub.status === "GRADED" ? "#10b981" : "#f59e0b" }}>
                                  {sub.status === "GRADED" ? "Sudah Dinilai" : "Belum Dinilai"}
                                </span>
                              </div>
                              <p style={{ margin: "0 0 6px", fontSize: 13, color: "var(--text-secondary)" }}>{sub.content}</p>
                              {sub.fileUrl && <a href={sub.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: "var(--accent-primary)" }}>📎 Lihat file</a>}
                              {sub.status === "GRADED" && <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>Nilai: <strong style={{ color: "var(--text-primary)" }}>{sub.score}</strong> — {sub.feedback}</p>}
                            </div>
                            {sub.status !== "GRADED" && (
                              <button onClick={() => { setGrading({ assignmentId: a.id, userId: sub.userId, name: sub.user.name }); setGradeForm({ score: "", feedback: "" }); }} style={{ background: "var(--accent-primary)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13, marginLeft: 12, flexShrink: 0 }}>
                                Beri Nilai
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 }}>
          <div style={{ background: "var(--card-bg)", borderRadius: 16, padding: 28, width: "100%", maxWidth: 500 }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>Buat Tugas Baru</h2>
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Modul</label>
                <select required value={form.moduleId} onChange={(e) => setForm((p) => ({ ...p, moduleId: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14 }}>
                  <option value="">Pilih modul</option>
                  {modules.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
              </div>
              {[
                { label: "Judul Tugas", key: "title", type: "text" },
                { label: "Deskripsi", key: "description", type: "text" },
              ].map((f) => (
                <div key={f.key}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>{f.label}</label>
                  <input type={f.type} required value={(form as any)[f.key]} onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, boxSizing: "border-box" }} />
                </div>
              ))}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Deadline (opsional)</label>
                  <input type="datetime-local" value={form.deadline} onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Nilai Maks</label>
                  <input type="number" required value={form.maxScore} onChange={(e) => setForm((p) => ({ ...p, maxScore: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, boxSizing: "border-box" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
                <button type="button" onClick={() => setShowCreate(false)} style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid var(--border-color)", background: "none", color: "var(--text-secondary)", cursor: "pointer" }}>Batal</button>
                <button type="submit" style={{ padding: "10px 24px", borderRadius: 8, background: "var(--accent-primary)", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grade modal */}
      {grading && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 }}>
          <div style={{ background: "var(--card-bg)", borderRadius: 16, padding: 28, width: "100%", maxWidth: 420 }}>
            <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>Beri Nilai</h2>
            <p style={{ margin: "0 0 20px", color: "var(--text-secondary)", fontSize: 14 }}>{grading.name}</p>
            <form onSubmit={handleGrade} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Nilai</label>
                <input type="number" required min={0} value={gradeForm.score} onChange={(e) => setGradeForm((p) => ({ ...p, score: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Feedback (opsional)</label>
                <textarea value={gradeForm.feedback} onChange={(e) => setGradeForm((p) => ({ ...p, feedback: e.target.value }))} rows={3} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, resize: "vertical", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setGrading(null)} style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid var(--border-color)", background: "none", color: "var(--text-secondary)", cursor: "pointer" }}>Batal</button>
                <button type="submit" style={{ padding: "10px 24px", borderRadius: 8, background: "var(--accent-primary)", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}>Simpan Nilai</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
