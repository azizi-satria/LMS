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
  _count?: { questions: number; attempts: number };
  questions?: Question[];
}

const typeLabels = { PRE_TEST: "Pre-Test", POST_TEST: "Post-Test", MODULE_QUIZ: "Kuis Modul" };
const typeColors = {
  PRE_TEST: { bg: "rgba(6,182,212,0.15)", color: "#06b6d4" },
  POST_TEST: { bg: "rgba(168,85,247,0.15)", color: "#a855f7" },
  MODULE_QUIZ: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b" },
};

const inputStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#f1f5f9",
  borderRadius: "12px",
  padding: "10px 14px",
  fontSize: "14px",
  width: "100%",
  outline: "none",
};

export default function QuizzesPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadText, setUploadText] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);

  const [quizForm, setQuizForm] = useState({
    type: "MODULE_QUIZ" as Quiz["type"],
    title: "",
    description: "",
    passingScore: 70,
    timeLimit: "",
    randomize: false,
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

  const fetchQuizzes = useCallback(async () => {
    const res = await fetch(`/api/quizzes?courseId=${courseId}`);
    if (res.ok) setQuizzes(await res.json());
    setLoading(false);
  }, [courseId]);

  const fetchQuizDetail = useCallback(async (quizId: string) => {
    const res = await fetch(`/api/quizzes/${quizId}?withAnswers=true`);
    if (res.ok) {
      const data = await res.json();
      setSelectedQuiz(data.quiz);
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
      }),
    });
    if (res.ok) {
      setShowCreateQuiz(false);
      setQuizForm({ type: "MODULE_QUIZ", title: "", description: "", passingScore: 70, timeLimit: "", randomize: false });
      fetchQuizzes();
    }
    setSaving(false);
  }

  async function handleAddQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedQuiz) return;
    setSaving(true);
    const res = await fetch(`/api/quizzes/${selectedQuiz.id}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(questionForm),
    });
    if (res.ok) {
      setShowAddQuestion(false);
      setQuestionForm({ text: "", points: 1, explanation: "", options: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }] });
      fetchQuizDetail(selectedQuiz.id);
    }
    setSaving(false);
  }

  async function handleDeleteQuestion(questionId: string) {
    if (!confirm("Hapus soal ini?")) return;
    await fetch(`/api/questions/${questionId}`, { method: "DELETE" });
    if (selectedQuiz) fetchQuizDetail(selectedQuiz.id);
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
        fetchQuizDetail(selectedQuiz.id);
        fetchQuizzes();
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href={`/instructor/courses/${courseId}/edit`} className="flex items-center gap-1 text-sm mb-2 transition-colors" style={{ color: "#64748b" }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Kembali ke Edit Kursus
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: "#f1f5f9" }}>Manajemen Quiz & Test</h1>
        </div>
        <button onClick={() => setShowCreateQuiz(true)} className="gradient-btn px-4 py-2 rounded-xl text-sm font-semibold">
          + Buat Quiz Baru
        </button>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Quiz List */}
        <div className="col-span-1">
          <div className="space-y-2">
            {loading ? (
              <div style={{ color: "#64748b" }} className="text-center py-8">Memuat...</div>
            ) : quizzes.length === 0 ? (
              <div className="glass-card p-6 text-center" style={{ color: "#64748b" }}>
                Belum ada quiz. Buat quiz pertama!
              </div>
            ) : quizzes.map((q) => (
              <div
                key={q.id}
                onClick={() => fetchQuizDetail(q.id)}
                className="glass-card p-4 cursor-pointer transition-all"
                style={{
                  border: selectedQuiz?.id === q.id ? "1px solid rgba(168,85,247,0.5)" : undefined,
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={typeColors[q.type]}>
                    {typeLabels[q.type]}
                  </span>
                </div>
                <p className="font-medium text-sm" style={{ color: "#f1f5f9" }}>{q.title}</p>
                <p className="text-xs mt-1" style={{ color: "#64748b" }}>
                  {q._count?.questions} soal · Lulus ≥{q.passingScore}%
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quiz Detail */}
        <div className="col-span-2">
          {!selectedQuiz ? (
            <div className="glass-card p-12 text-center" style={{ color: "#64748b" }}>
              Pilih quiz di sebelah kiri untuk melihat soal-soalnya.
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
                        <span className="text-xs" style={{ color: "#64748b" }}>⏱ {selectedQuiz.timeLimit} menit</span>
                      )}
                    </div>
                    <h2 className="font-bold text-lg" style={{ color: "#f1f5f9" }}>{selectedQuiz.title}</h2>
                    {selectedQuiz.description && <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>{selectedQuiz.description}</p>}
                    <p className="text-sm mt-2" style={{ color: "#64748b" }}>
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
                      Upload Soal
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

              {/* Questions */}
              <div className="space-y-3">
                {!selectedQuiz.questions || selectedQuiz.questions.length === 0 ? (
                  <div className="glass-card p-8 text-center" style={{ color: "#64748b" }}>
                    Belum ada soal. Tambah soal atau upload via JSON.
                  </div>
                ) : selectedQuiz.questions.map((q, idx) => (
                  <div key={q.id} className="glass-card p-4">
                    <div className="flex items-start justify-between mb-3">
                      <p className="font-medium text-sm flex-1" style={{ color: "#f1f5f9" }}>
                        <span style={{ color: "#64748b" }}>{idx + 1}. </span>{q.text}
                        <span className="ml-2 text-xs" style={{ color: "#64748b" }}>({q.points} poin)</span>
                      </p>
                      <button onClick={() => handleDeleteQuestion(q.id)} className="text-xs ml-4 flex-shrink-0" style={{ color: "#ef4444" }}>Hapus</button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((o) => (
                        <div key={o.id} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                          style={{ background: o.isCorrect ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.03)", border: o.isCorrect ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(255,255,255,0.06)" }}>
                          {o.isCorrect && <span style={{ color: "#22c55e" }}>✓</span>}
                          <span style={{ color: o.isCorrect ? "#22c55e" : "#94a3b8" }}>{o.text}</span>
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

      {/* Create Quiz Modal */}
      {showCreateQuiz && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="glass-card p-6 w-full max-w-md">
            <h2 className="font-bold text-lg mb-4" style={{ color: "#f1f5f9" }}>Buat Quiz Baru</h2>
            <form onSubmit={handleCreateQuiz} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#94a3b8" }}>Tipe</label>
                <select value={quizForm.type} onChange={(e) => setQuizForm({ ...quizForm, type: e.target.value as Quiz["type"] })} style={{ ...inputStyle, background: "#111118" }} className="dark-input">
                  <option value="PRE_TEST" style={{ background: "#111118" }}>Pre-Test (sebelum materi)</option>
                  <option value="POST_TEST" style={{ background: "#111118" }}>Post-Test (akhir kursus)</option>
                  <option value="MODULE_QUIZ" style={{ background: "#111118" }}>Kuis Modul</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#94a3b8" }}>Judul</label>
                <input type="text" value={quizForm.title} onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })} required style={inputStyle} className="dark-input" placeholder="Contoh: Pre-Test Pemrograman Web" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#94a3b8" }}>Deskripsi (opsional)</label>
                <textarea value={quizForm.description} onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })} rows={2} style={{ ...inputStyle, resize: "none" }} className="dark-input" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "#94a3b8" }}>Nilai Lulus (%)</label>
                  <input type="number" value={quizForm.passingScore} onChange={(e) => setQuizForm({ ...quizForm, passingScore: parseInt(e.target.value) })} min={1} max={100} style={inputStyle} className="dark-input" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "#94a3b8" }}>Batas Waktu (menit, opsional)</label>
                  <input type="number" value={quizForm.timeLimit} onChange={(e) => setQuizForm({ ...quizForm, timeLimit: e.target.value })} min={1} style={inputStyle} className="dark-input" placeholder="Kosong = tanpa batas" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={quizForm.randomize} onChange={(e) => setQuizForm({ ...quizForm, randomize: e.target.checked })} />
                <span className="text-sm" style={{ color: "#94a3b8" }}>Acak urutan soal</span>
              </label>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowCreateQuiz(false)} className="px-4 py-2 rounded-lg text-sm" style={{ color: "#64748b", border: "1px solid var(--border)", background: "transparent" }}>Batal</button>
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
            <h2 className="font-bold text-lg mb-4" style={{ color: "#f1f5f9" }}>Tambah Soal</h2>
            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#94a3b8" }}>Teks Soal</label>
                <textarea value={questionForm.text} onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })} required rows={3} style={{ ...inputStyle, resize: "none" }} className="dark-input" placeholder="Tulis soal di sini..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "#94a3b8" }}>Poin</label>
                  <input type="number" value={questionForm.points} onChange={(e) => setQuestionForm({ ...questionForm, points: parseInt(e.target.value) || 1 })} min={1} style={inputStyle} className="dark-input" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: "#94a3b8" }}>Pilihan Jawaban <span style={{ color: "#64748b" }}>(centang yang benar)</span></label>
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
                        style={{ accentColor: "#a855f7", flexShrink: 0 }}
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
                        style={{ ...inputStyle, flex: 1 }}
                        className="dark-input"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#94a3b8" }}>Penjelasan Jawaban (opsional)</label>
                <input type="text" value={questionForm.explanation} onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })} style={inputStyle} className="dark-input" placeholder="Akan ditampilkan setelah submit..." />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowAddQuestion(false)} className="px-4 py-2 rounded-lg text-sm" style={{ color: "#64748b", border: "1px solid var(--border)", background: "transparent" }}>Batal</button>
                <button type="submit" disabled={saving} className="gradient-btn px-4 py-2 rounded-lg text-sm">{saving ? "Menyimpan..." : "Tambah Soal"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && selectedQuiz && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="glass-card p-6 w-full max-w-2xl">
            <h2 className="font-bold text-lg mb-2" style={{ color: "#f1f5f9" }}>Upload Soal via JSON</h2>
            <p className="text-sm mb-4" style={{ color: "#64748b" }}>Paste array JSON berisi soal-soal. Format:</p>
            <pre className="text-xs p-3 rounded-lg mb-4 overflow-x-auto" style={{ background: "rgba(0,0,0,0.3)", color: "#06b6d4" }}>{exampleJson}</pre>
            <form onSubmit={handleUpload} className="space-y-3">
              <textarea
                value={uploadText}
                onChange={(e) => setUploadText(e.target.value)}
                rows={10}
                style={{ ...inputStyle, resize: "vertical", fontFamily: "monospace", fontSize: "12px" }}
                className="dark-input"
                placeholder="Paste JSON di sini..."
              />
              {uploadError && <p className="text-sm" style={{ color: "#ef4444" }}>{uploadError}</p>}
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => { setShowUpload(false); setUploadError(""); setUploadText(""); }} className="px-4 py-2 rounded-lg text-sm" style={{ color: "#64748b", border: "1px solid var(--border)", background: "transparent" }}>Batal</button>
                <button type="submit" disabled={uploading} className="gradient-btn px-4 py-2 rounded-lg text-sm">{uploading ? "Mengupload..." : "Upload Soal"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
