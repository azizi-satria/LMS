"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

interface Assignment {
  id: string;
  title: string;
  description: string;
  deadline?: string;
  maxScore: number;
  module: { title: string };
  submissions?: {
    content: string;
    fileUrl?: string;
    score?: number;
    feedback?: string;
    status: string;
    submittedAt: string;
  }[];
}

export default function StudentAssignmentsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [forms, setForms] = useState<Record<string, { content: string; fileUrl: string }>>({});

  const load = () => {
    fetch(`/api/assignments?courseId=${courseId}`)
      .then((r) => r.json())
      .then(async (data) => {
        if (!Array.isArray(data)) { setLoading(false); return; }
        // Load my submissions for each
        const withSubs = await Promise.all(
          data.map(async (a: Assignment) => {
            const r = await fetch(`/api/assignments/${a.id}/my-submission`);
            if (r.ok) {
              const sub = await r.json();
              return { ...a, submissions: sub ? [sub] : [] };
            }
            return { ...a, submissions: [] };
          })
        );
        setAssignments(withSubs);
        setLoading(false);
      });
  };

  useEffect(() => { load(); }, [courseId]);

  const handleSubmit = async (e: React.FormEvent, assignmentId: string) => {
    e.preventDefault();
    const f = forms[assignmentId];
    if (!f?.content?.trim()) return;
    setSubmitting(assignmentId);
    await fetch(`/api/assignments/${assignmentId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: f.content, fileUrl: f.fileUrl || null }),
    });
    setSubmitting(null);
    setForms((p) => ({ ...p, [assignmentId]: { content: "", fileUrl: "" } }));
    load();
  };

  const isExpired = (deadline?: string) => deadline ? new Date(deadline) < new Date() : false;

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px" }}>
      <button onClick={() => router.push(`/courses/${courseId}`)} style={{ background: "none", border: "none", color: "var(--accent-primary)", cursor: "pointer", marginBottom: 20, display: "flex", alignItems: "center", gap: 6, padding: 0 }}>
        ← Kembali ke Kursus
      </button>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", marginBottom: 24 }}>Tugas Kursus</h1>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-secondary)" }}>Memuat...</div>
      ) : assignments.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 12 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <p style={{ color: "var(--text-secondary)" }}>Belum ada tugas untuk kursus ini.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {assignments.map((a) => {
            const sub = a.submissions?.[0];
            const expired = isExpired(a.deadline);
            const form = forms[a.id] || { content: "", fileUrl: "" };

            return (
              <div key={a.id} style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 14, overflow: "hidden" }}>
                <div style={{ padding: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--text-primary)" }}>{a.title}</h3>
                        <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 20, background: "var(--bg-secondary)", color: "var(--text-secondary)" }}>{a.module.title}</span>
                      </div>
                      <p style={{ margin: "0 0 10px", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{a.description}</p>
                      <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--text-secondary)" }}>
                        <span>Nilai maks: <strong style={{ color: "var(--text-primary)" }}>{a.maxScore}</strong></span>
                        {a.deadline && (
                          <span style={{ color: expired ? "#ef4444" : "var(--text-secondary)" }}>
                            Deadline: {new Date(a.deadline).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                            {expired && " (Kadaluarsa)"}
                          </span>
                        )}
                      </div>
                    </div>
                    {sub && (
                      <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 600, background: sub.status === "GRADED" ? "#10b98122" : "#f59e0b22", color: sub.status === "GRADED" ? "#10b981" : "#f59e0b", flexShrink: 0 }}>
                        {sub.status === "GRADED" ? `✓ Nilai: ${sub.score}` : "Menunggu Penilaian"}
                      </span>
                    )}
                  </div>

                  {/* Submission result */}
                  {sub && (
                    <div style={{ background: "var(--bg-secondary)", borderRadius: 10, padding: 14, marginTop: 10 }}>
                      <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Jawaban Anda:</p>
                      <p style={{ margin: "0 0 8px", fontSize: 13, color: "var(--text-secondary)" }}>{sub.content}</p>
                      {sub.fileUrl && <a href={sub.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: "var(--accent-primary)" }}>📎 File terlampir</a>}
                      {sub.feedback && (
                        <div style={{ marginTop: 10, padding: "10px 14px", background: "#6366f122", borderRadius: 8, borderLeft: "3px solid #6366f1" }}>
                          <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>
                            <strong style={{ color: "#6366f1" }}>Feedback Dosen:</strong> {sub.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Submit form — only if not yet submitted or not graded */}
                  {!sub && !expired && (
                    <form onSubmit={(e) => handleSubmit(e, a.id)} style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Jawaban / Isi Tugas <span style={{ color: "#ef4444" }}>*</span></label>
                        <textarea
                          required
                          rows={4}
                          value={form.content}
                          onChange={(e) => setForms((p) => ({ ...p, [a.id]: { ...form, content: e.target.value } }))}
                          placeholder="Tulis jawaban atau deskripsi pengerjaan tugas..."
                          style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, resize: "vertical", boxSizing: "border-box" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Link File (Google Drive, dll) — opsional</label>
                        <input
                          type="url"
                          value={form.fileUrl}
                          onChange={(e) => setForms((p) => ({ ...p, [a.id]: { ...form, fileUrl: e.target.value } }))}
                          placeholder="https://drive.google.com/..."
                          style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, boxSizing: "border-box" }}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submitting === a.id}
                        style={{ alignSelf: "flex-start", background: "var(--accent-primary)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontWeight: 600, cursor: "pointer", opacity: submitting === a.id ? 0.7 : 1 }}
                      >
                        {submitting === a.id ? "Mengumpulkan..." : "Kumpulkan Tugas"}
                      </button>
                    </form>
                  )}

                  {expired && !sub && (
                    <div style={{ marginTop: 12, padding: "10px 14px", background: "#ef444422", borderRadius: 8 }}>
                      <p style={{ margin: 0, fontSize: 13, color: "#ef4444" }}>Deadline telah lewat. Tugas tidak dapat dikumpulkan.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
