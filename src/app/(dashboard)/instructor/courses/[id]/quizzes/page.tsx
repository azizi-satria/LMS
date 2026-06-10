"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Question {
  id: string;
  text: string;
  points: number;
  explanation?: string;
  options: { id: string; text: string; isCorrect: boolean; order: number }[];
}

interface Quiz {
  id: string;
  type: "PRE_TEST" | "POST_TEST" | "MODULE_QUIZ";
  title: string;
  description?: string;
  passingScore: number;
  timeLimit?: number;
  randomize: boolean;
  moduleId?: string;
  _count?: { questions: number; attempts: number };
  questions?: Question[];
}

interface Module {
  id: string;
  title: string;
  order: number;
}

const typeLabels = { PRE_TEST: "Pre-Test", POST_TEST: "Post-Test", MODULE_QUIZ: "Kuis Modul" };
const typeColors = {
  PRE_TEST: { bg: "rgba(6,182,212,0.15)", color: "#06b6d4" },
  POST_TEST: { bg: "rgba(168,85,247,0.15)", color: "#a855f7" },
  MODULE_QUIZ: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b" },
};

const inputStyle = {
  background: "var(--bg-secondary)",
  border: "1px solid var(--border-color)",
  color: "var(--text-primary)",
  borderRadius: "12px",
  padding: "10px 14px",
  fontSize: "14px",
  width: "100%",
  outline: "none",
  boxSizing: "border-box" as const,
};

function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 100, padding: "12px 20px", borderRadius: 12, background: ok ? "#10b981" : "#ef4444", color: "#fff", fontWeight: 600, fontSize: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
      {ok ? "✓ " : "✗ "}{msg}
    </div>
  );
}

export default function QuizzesPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadText, setUploadText] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const [quizForm, setQuizForm] = useState({
    type: "MODULE_QUIZ" as Quiz["type"],
    title: "",
    description: "",
    passingScore: 70,
    timeLimit: "",
    randomize: false,
    moduleId: "",
  });

  const [questionForm, setQuestionForm] = useState({
    text: "",
    points: 1,
    explanation: "",
    options: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
  });

  const [saving, setSaving] = useState(false);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchQuizzes = useCallback(async () => {
    const [qRes, mRes] = await Promise.all([
      fetch(`/api/quizzes?courseId=${courseId}`),
      fetch(`/api/courses/${courseId}/modules`),
    ]);
    if (qRes.ok) setQuizzes(await qRes.json());
    if (mRes.ok) setModules(await mRes.json());
    setLoading(false);
  }, [courseId]);

  const fetchQuizDetail = useCallback(async (quizId: string) => {
    const res = await fetch(`/api/quizzes/${quizId}?withAnswers=true`);
    if (res.ok) {
      const data = await res.json();
      setSelectedQuiz(data.quiz || data);
    }
  }, []);

  useEffect(() => { fetchQuizzes(); }, [fetchQuizzes]);

  async function handleCreateQuiz(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/quizzes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId,
        type: quizForm.type,
        title: quizForm.title,
        description: quizForm.description,
        passingScore: quizForm.passingScore,
        timeLimit: quizForm.timeLimit ? parseInt(quizForm.timeLimit) : null,
        randomize: quizForm.randomize,
        moduleId: quizForm.type === "MODULE_QUIZ" && quizForm.moduleId ? quizForm.moduleId : null,
      }),
    });
    if (res.ok) {
      setShowCreateQuiz(false);
      setQuizForm({ type: "MODULE_QUIZ", title: "", description: "", passingScore: 70, timeLimit: "", randomize: false, moduleId: "" });
      await fetchQuizzes();
      showToast("Quiz berhasil dibuat!", true);
    } else {
      const err = await res.json();
      showToast(err.error || "Gagal membuat quiz.", false);
    }
    setSaving(false);
  }

  async function handleAddQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedQuiz) return;
    const hasCorrect = questionForm.options.some((o) => o.isCorrect);
    if (!hasCorrect) { showToast("Pilih minimal satu jawaban yang benar.", false); return; }
    setSaving(true);
    const res = await fetch(`/api/quizzes/${selectedQuiz.id}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(questionForm),
    });
    if (res.ok) {
      setShowAddQuestion(false);
      setQuestionForm({ text: "", points: 1, explanation: "", options: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }] });
      await fetchQuizDetail(selectedQuiz.id);
      await fetchQuizzes();
      showToast("Soal berhasil ditambahkan!", true);
    } else {
      const err = await res.json();
      showToast(err.error || "Gagal menambah soal.", false);
    }
    setSaving(false);
  }

  async function handleDeleteQuestion(questionId: string) {
    if (!confirm("Hapus soal ini?")) return;
    const res = await fetch(`/api/questions/${questionId}`, { method: "DELETE" });
    if (res.ok) {
      if (selectedQuiz) await fetchQuizDetail(selectedQuiz.id);
      await fetchQuizzes();
      showToast("Soal dihapus.", true);
    } else {
      showToast("Gagal menghapus soal.", false);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedQuiz) return;
    setUploadError("");
    setUploading(true);
    try {
      const parsed = JSON.parse(uploadText);
      const res = await fetch(`/api/quizzes/${selectedQuiz.id}/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      if (res.ok) {
        setShowUpload(false);
        setUploadText("");
        await fetchQuizDetail(selectedQuiz.id);
        await fetchQuizzes();
        showToast(`${data.count} soal berhasil diupload!`, true);
      } else {
        setUploadError(data.error);
      }
    } catch {
      setUploadError("Format JSON tidak valid.");
    }
    setUploading(false);
  }

  const exampleJson = JSON.stringify([
    {
      text: "Apa kepanjangan dari HTML?",
      points: 1,
      explanation: "HTML adalah HyperText Markup Language",
      options: [
        { text: "HyperText Markup Language", isCorrect: true },
        { text: "High Text Machine Language", isCorrect: false },
        { text: "HyperText Machine Language", isCorrect: false },
        { text: "HyperTransfer Markup Language", isCorrect: false },
      ],
    },
  ], null, 2);

  return (
    <div className="max-w-5xl">
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}

      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href={`/instructor/courses/${courseId}/edit`} className="flex items-center gap-1 text-sm mb-2 transition-colors" style={{ color: "#64748b" }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Kembali ke Edit Kursus
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Manajemen Quiz & Test</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Buat quiz, tambah soal, dan kelola bank soal</p>
        </div>
        <button onClick={() => setShowCreateQuiz(true)} className="gradient-btn px-4 py-2 rounded-xl text-sm font-semibold">
          + Buat Quiz Baru
        </button>
      </div>

      {/* Empty state — no quizzes yet */}
      {!loading && quizzes.length === 0 && (
        <div className="glass-card p-12 text-center mb-6">
          <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
          <h3 style={{ color: "var(--text-primary)", fontWeight: 600, marginBottom: 8 }}>Belum ada quiz</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>Buat Pre-Test, Kuis Modul, atau Post-Test untuk kursus ini.</p>
          <button onClick={() => setShowCreateQuiz(true)} className="gradient-btn px-6 py-2 rounded-xl text-sm font-semibold">+ Buat Quiz Pertama</button>
        </div>
      )}

      {quizzes.length > 0 && (
        <div className="grid grid-cols-3 gap-5">
          {/* Quiz List */}
          <div className="col-span-1 space-y-2">
            <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Daftar Quiz ({quizzes.length})</p>
            {quizzes.map((q) => (
              <div
                key={q.id}
                onClick={() => fetchQuizDetail(q.id)}
                className="glass-card p-4 cursor-pointer transition-all"
                style={{ border: selectedQuiz?.id === q.id ? "2px solid #a855f7" : "1px solid var(--border-color)" }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={typeColors[q.type]}>
                    {typeLabels[q.type]}
                  </span>
                </div>
                <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{q.title}</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                  {q._count?.questions ?? 0} soal · Lulus ≥{q.passingScore}%
                </p>
              </div>
            ))}
          </div>

          {/* Quiz Detail / Bank Soal */}
          <div className="col-span-2">
            {!selectedQuiz ? (
              <div className="glass-card p-12 text-center" style={{ color: "var(--text-secondary)" }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>👈</div>
                Klik quiz di sebelah kiri untuk melihat dan mengelola soal-soalnya.
              </div>
            ) : (
              <div>
                <div className="glass-card p-5 mb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={typeColors[selectedQuiz.type]}>
                          {typeLabels[selectedQuiz.type]}
                        </span>
                        {selectedQuiz.timeLimit && (
                          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>⏱ {selectedQuiz.timeLimit} menit</span>
                        )}
                      </div>
                      <h2 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>{selectedQuiz.title}</h2>
                      {selectedQuiz.description && <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{selectedQuiz.description}</p>}
                      <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
                        Bobot kelulusan: <strong style={{ color: "#22c55e" }}>{selectedQuiz.passingScore}%</strong>
                        {selectedQuiz.randomize && " · Soal diacak"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowUpload(true)}
                        className="px-3 py-1.5 text-xs rounded-lg font-medium"
                        style={{ background: "rgba(6,182,212,0.15)", color: "#06b6d4", border: "1px solid rgba(6,182,212,0.3)" }}
                      >
                        📤 Upload JSON
                      </button>
                      <button
                        onClick={() => setShowAddQuestion(true)}
                        className="gradient-btn px-3 py-1.5 text-xs rounded-lg font-medium"
                      >
                        + Tambah Soal
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bank Soal */}
                <p className="text-xs font-semibold mb-3" style={{ color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Bank Soal ({selectedQuiz.questions?.length ?? 0} soal)
                </p>
                <div className="space-y-3">
                  {!selectedQuiz.questions || selectedQuiz.questions.length === 0 ? (
                    <div className="glass-card p-8 text-center">
                      <p style={{ color: "var(--text-secondary)", marginBottom: 12 }}>Belum ada soal. Tambah soal atau upload via JSON.</p>
                      <div className="flex gap-3 justify-center">
                        <button onClick={() => setShowAddQuestion(true)} className="gradient-btn px-4 py-2 rounded-lg text-sm">+ Tambah Soal Manual</button>
                        <button onClick={() => setShowUpload(true)} className="px-4 py-2 rounded-lg text-sm" style={{ background: "rgba(6,182,212,0.15)", color: "#06b6d4", border: "1px solid rgba(6,182,212,0.3)" }}>📤 Upload JSON</button>
                      </div>
                    </div>
                  ) : selectedQuiz.questions.map((q, idx) => (
                    <div key={q.id} className="glass-card p-4">
                      <div className="flex items-start justify-between mb-3">
                        <p className="font-medium text-sm flex-1" style={{ color: "var(--text-primary)" }}>
                          <span style={{ color: "var(--text-secondary)" }}>{idx + 1}. </span>{q.text}
                          <span className="ml-2 text-xs" style={{ color: "var(--text-secondary)" }}>({q.points} poin)</span>
                        </p>
                        <button onClick={() => handleDeleteQuestion(q.id)} className="text-xs ml-4 flex-shrink-0" style={{ color: "#ef4444" }}>Hapus</button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {q.options.map((o) => (
                          <div key={o.id} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                            style={{ background: o.isCorrect ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.03)", border: o.isCorrect ? "1px solid rgba(34,197,94,0.4)" : "1px solid var(--border-color)" }}>
                            {o.isCorrect && <span style={{ color: "#22c55e" }}>✓</span>}
                            <span style={{ color: o.isCorrect ? "#22c55e" : "var(--text-secondary)" }}>{o.text}</span>
                          </div>
                        ))}
                      </div>
                      {q.explanation && (
                        <p className="text-xs mt-2 px-3 py-2 rounded-lg" style={{ background: "rgba(168,85,247,0.08)", color: "#a855f7" }}>
                          💡 {q.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Quiz Modal */}
      {showCreateQuiz && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="glass-card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="font-bold text-lg mb-4" style={{ color: "var(--text-primary)" }}>Buat Quiz Baru</h2>
            <form onSubmit={handleCreateQuiz} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Tipe Quiz</label>
                <select value={quizForm.type} onChange={(e) => setQuizForm({ ...quizForm, type: e.target.value as Quiz["type"], moduleId: "" })} style={inputStyle}>
                  <option value="PRE_TEST">Pre-Test — ditampilkan sebelum kursus dimulai</option>
                  <option value="MODULE_QUIZ">Kuis Modul — ditampilkan di akhir modul tertentu</option>
                  <option value="POST_TEST">Post-Test — ditampilkan setelah semua materi selesai</option>
                </select>
              </div>
              {quizForm.type === "MODULE_QUIZ" && (
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Letak di Modul</label>
                  <select value={quizForm.moduleId} onChange={(e) => setQuizForm({ ...quizForm, moduleId: e.target.value })} style={inputStyle}>
                    <option value="">-- Pilih modul tempat kuis ini --</option>
                    {modules.map((m) => (
                      <option key={m.id} value={m.id}>Modul {m.order}: {m.title}</option>
                    ))}
                  </select>
                  <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>Kuis akan muncul setelah peserta menyelesaikan modul ini.</p>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Judul Quiz</label>
                <input type="text" value={quizForm.title} onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })} required style={inputStyle} placeholder="Contoh: Pre-Test Pemrograman Web" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Deskripsi (opsional)</label>
                <textarea value={quizForm.description} onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })} rows={2} style={{ ...inputStyle, resize: "none" }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Nilai Lulus (%)</label>
                  <input type="number" value={quizForm.passingScore} onChange={(e) => setQuizForm({ ...quizForm, passingScore: parseInt(e.target.value) })} min={1} max={100} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Batas Waktu (menit)</label>
                  <input type="number" value={quizForm.timeLimit} onChange={(e) => setQuizForm({ ...quizForm, timeLimit: e.target.value })} min={1} style={inputStyle} placeholder="Kosong = tanpa batas" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={quizForm.randomize} onChange={(e) => setQuizForm({ ...quizForm, randomize: e.target.checked })} style={{ accentColor: "#a855f7" }} />
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Acak urutan soal</span>
              </label>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowCreateQuiz(false)} className="px-4 py-2 rounded-lg text-sm" style={{ color: "var(--text-secondary)", border: "1px solid var(--border-color)", background: "transparent" }}>Batal</button>
                <button type="submit" disabled={saving} className="gradient-btn px-4 py-2 rounded-lg text-sm">{saving ? "Menyimpan..." : "Buat Quiz"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Question Modal */}
      {showAddQuestion && selectedQuiz && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="glass-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="font-bold text-lg mb-1" style={{ color: "var(--text-primary)" }}>Tambah Soal</h2>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>Quiz: {selectedQuiz.title}</p>
            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Teks Soal *</label>
                <textarea value={questionForm.text} onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })} required rows={3} style={{ ...inputStyle, resize: "none" }} placeholder="Tulis soal di sini..." />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Poin</label>
                <input type="number" value={questionForm.points} onChange={(e) => setQuestionForm({ ...questionForm, points: parseInt(e.target.value) || 1 })} min={1} style={{ ...inputStyle, width: "100px" }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Pilihan Jawaban — <span style={{ color: "#a855f7" }}>klik radio untuk tandai jawaban benar</span>
                </label>
                <div className="space-y-2">
                  {questionForm.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={opt.isCorrect}
                        onChange={() => setQuestionForm({
                          ...questionForm,
                          options: questionForm.options.map((o, i) => ({ ...o, isCorrect: i === idx })),
                        })}
                        style={{ accentColor: "#a855f7", flexShrink: 0, width: 18, height: 18 }}
                      />
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => setQuestionForm({
                          ...questionForm,
                          options: questionForm.options.map((o, i) => i === idx ? { ...o, text: e.target.value } : o),
                        })}
                        required
                        placeholder={`Pilihan ${String.fromCharCode(65 + idx)}`}
                        style={{ ...inputStyle }}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>Klik lingkaran di kiri untuk menandai jawaban yang benar.</p>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Penjelasan Jawaban (opsional)</label>
                <input type="text" value={questionForm.explanation} onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })} style={inputStyle} placeholder="Akan ditampilkan setelah peserta submit..." />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowAddQuestion(false)} className="px-4 py-2 rounded-lg text-sm" style={{ color: "var(--text-secondary)", border: "1px solid var(--border-color)", background: "transparent" }}>Batal</button>
                <button type="submit" disabled={saving} className="gradient-btn px-4 py-2 rounded-lg text-sm">{saving ? "Menyimpan..." : "Tambah Soal"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && selectedQuiz && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="glass-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="font-bold text-lg mb-2" style={{ color: "var(--text-primary)" }}>Upload Soal via JSON</h2>
            <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>Paste array JSON berisi soal-soal. Contoh format:</p>
            <pre className="text-xs p-3 rounded-lg mb-4 overflow-x-auto" style={{ background: "rgba(0,0,0,0.3)", color: "#06b6d4" }}>{exampleJson}</pre>
            <form onSubmit={handleUpload} className="space-y-3">
              <textarea
                value={uploadText}
                onChange={(e) => setUploadText(e.target.value)}
                rows={10}
                style={{ ...inputStyle, resize: "vertical", fontFamily: "monospace", fontSize: "12px" }}
                placeholder="Paste JSON di sini..."
              />
              {uploadError && <p className="text-sm" style={{ color: "#ef4444" }}>{uploadError}</p>}
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => { setShowUpload(false); setUploadError(""); setUploadText(""); }} className="px-4 py-2 rounded-lg text-sm" style={{ color: "var(--text-secondary)", border: "1px solid var(--border-color)", background: "transparent" }}>Batal</button>
                <button type="submit" disabled={uploading} className="gradient-btn px-4 py-2 rounded-lg text-sm">{uploading ? "Mengupload..." : "Upload Soal"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
