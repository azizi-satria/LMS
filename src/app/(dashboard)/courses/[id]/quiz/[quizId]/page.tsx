"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

interface QuestionOption {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  imageUrl?: string;
  points: number;
  order: number;
  explanation?: string;
  options: QuestionOption[];
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  type: "PRE_TEST" | "POST_TEST" | "MODULE_QUIZ";
  passingScore: number;
  timeLimit?: number;
  randomize: boolean;
  questions: Question[];
}

interface AttemptResult {
  id: string;
  score: number;
  totalPoints: number;
  isPassed: boolean;
  answers: {
    questionId: string;
    optionId: string;
    isCorrect: boolean;
  }[];
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const quizId = params.quizId as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<"intro" | "taking" | "result">("intro");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [certificateIssued, setCertificateIssued] = useState(false);

  useEffect(() => {
    fetch(`/api/quizzes/${quizId}`)
      .then((r) => r.json())
      .then((data) => {
        setQuiz(data);
        setLoading(false);
      });
  }, [quizId]);

  const handleSubmit = useCallback(async () => {
    if (!quiz) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitting(true);

    const answersArray = Object.entries(answers).map(([questionId, optionId]) => ({
      questionId,
      optionId,
    }));

    const res = await fetch(`/api/quizzes/${quizId}/attempt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: answersArray }),
    });

    const data = await res.json();
    setResult(data);
    if (data.isPassed && quiz.type === "POST_TEST" && data.certificateIssued) {
      setCertificateIssued(true);
    }
    setPhase("result");
    setSubmitting(false);
  }, [quiz, quizId, answers]);

  const startQuiz = () => {
    if (quiz?.timeLimit) {
      setTimeLeft(quiz.timeLimit * 60);
    }
    setPhase("taking");
  };

  useEffect(() => {
    if (phase === "taking" && timeLeft !== null) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, timeLeft, handleSubmit]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const typeBadge = (type: string) => {
    const map: Record<string, { label: string; color: string }> = {
      PRE_TEST: { label: "Pre-Test", color: "#6366f1" },
      POST_TEST: { label: "Post-Test", color: "#f59e0b" },
      MODULE_QUIZ: { label: "Kuis Modul", color: "#10b981" },
    };
    return map[type] || { label: type, color: "#6b7280" };
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid var(--border-color)", borderTopColor: "var(--accent-primary)", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <p style={{ color: "var(--text-secondary)" }}>Kuis tidak ditemukan.</p>
      </div>
    );
  }

  const badge = typeBadge(quiz.type);

  /* ── INTRO ─────────────────────────────────────────────── */
  if (phase === "intro") {
    return (
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "var(--accent-primary)", cursor: "pointer", marginBottom: 24, display: "flex", alignItems: "center", gap: 6 }}>
          ← Kembali
        </button>
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 16, padding: 36, textAlign: "center" }}>
          <span style={{ background: badge.color + "22", color: badge.color, padding: "4px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600 }}>{badge.label}</span>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--text-primary)", margin: "20px 0 12px" }}>{quiz.title}</h1>
          {quiz.description && <p style={{ color: "var(--text-secondary)", marginBottom: 24, lineHeight: 1.6 }}>{quiz.description}</p>}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
            {[
              { label: "Jumlah Soal", value: quiz.questions.length },
              { label: "Nilai Kelulusan", value: `${quiz.passingScore}%` },
              { label: "Batas Waktu", value: quiz.timeLimit ? `${quiz.timeLimit} menit` : "Tidak ada" },
            ].map((item) => (
              <div key={item.label} style={{ background: "var(--bg-secondary)", borderRadius: 12, padding: "14px 10px" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "var(--accent-primary)" }}>{item.value}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>{item.label}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "var(--bg-secondary)", borderRadius: 12, padding: 16, textAlign: "left", marginBottom: 28 }}>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>
              • Pastikan koneksi internet stabil sebelum memulai.<br />
              • Jawab semua pertanyaan sebelum submit.<br />
              • Hasil akan ditampilkan langsung setelah submit.
            </p>
          </div>

          <button
            onClick={startQuiz}
            style={{ background: "var(--accent-primary)", color: "#fff", border: "none", borderRadius: 10, padding: "14px 40px", fontSize: 16, fontWeight: 600, cursor: "pointer", width: "100%" }}
          >
            Mulai {badge.label}
          </button>
        </div>
      </div>
    );
  }

  /* ── TAKING ─────────────────────────────────────────────── */
  if (phase === "taking") {
    const answered = Object.keys(answers).length;
    const total = quiz.questions.length;
    const progress = total > 0 ? (answered / total) * 100 : 0;

    return (
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px" }}>
        {/* Header */}
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 12, padding: "14px 20px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{badge.label}</span>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>{quiz.title}</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{answered}/{total} dijawab</span>
            {timeLeft !== null && (
              <span style={{ background: timeLeft < 60 ? "#ef444422" : "var(--bg-secondary)", color: timeLeft < 60 ? "#ef4444" : "var(--text-primary)", padding: "6px 14px", borderRadius: 8, fontWeight: 700, fontFamily: "monospace", fontSize: 18 }}>
                ⏱ {formatTime(timeLeft)}
              </span>
            )}
          </div>
        </div>

        {/* Progress */}
        <div style={{ height: 4, background: "var(--bg-secondary)", borderRadius: 2, marginBottom: 28 }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "var(--accent-primary)", borderRadius: 2, transition: "width 0.3s" }} />
        </div>

        {/* Questions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {quiz.questions.map((q, idx) => (
            <div key={q.id} style={{ background: "var(--card-bg)", border: `2px solid ${answers[q.id] ? "var(--accent-primary)" : "var(--border-color)"}`, borderRadius: 12, padding: 24, transition: "border-color 0.2s" }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <span style={{ background: "var(--accent-primary)", color: "#fff", borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{idx + 1}</span>
                <p style={{ margin: 0, color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.6 }}>{q.text}</p>
              </div>
              {q.imageUrl && <img src={q.imageUrl} alt="" style={{ maxWidth: "100%", borderRadius: 8, marginBottom: 16 }} />}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {q.options.map((opt) => {
                  const selected = answers[q.id] === opt.id;
                  return (
                    <label key={opt.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 8, border: `1px solid ${selected ? "var(--accent-primary)" : "var(--border-color)"}`, background: selected ? "var(--accent-primary)11" : "var(--bg-secondary)", cursor: "pointer", transition: "all 0.15s" }}>
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={opt.id}
                        checked={selected}
                        onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                        style={{ accentColor: "var(--accent-primary)" }}
                      />
                      <span style={{ color: "var(--text-primary)", fontSize: 14 }}>{opt.text}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Submit */}
        <div style={{ marginTop: 32, background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            {total - answered} soal belum dijawab
          </span>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{ background: answered === total ? "var(--accent-primary)" : "#6b7280", color: "#fff", border: "none", borderRadius: 10, padding: "12px 32px", fontSize: 15, fontWeight: 600, cursor: answered === total ? "pointer" : "not-allowed", opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? "Mengirim..." : "Submit Jawaban"}
          </button>
        </div>
      </div>
    );
  }

  /* ── RESULT ─────────────────────────────────────────────── */
  if (phase === "result" && result) {
    const scorePercent = result.score;
    const isPassed = result.isPassed;
    const answerMap = Object.fromEntries(result.answers.map((a) => [a.questionId, a]));

    return (
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px" }}>
        {/* Score card */}
        <div style={{ background: isPassed ? "linear-gradient(135deg,#10b98122,#059669)" : "linear-gradient(135deg,#ef444422,#dc2626)", border: `1px solid ${isPassed ? "#10b981" : "#ef4444"}`, borderRadius: 16, padding: 36, textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 64, marginBottom: 8 }}>{isPassed ? "🎉" : "😔"}</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 8px" }}>
            {isPassed ? "Selamat, Anda Lulus!" : "Belum Lulus"}
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
            {isPassed ? "Anda berhasil melewati batas kelulusan." : `Nilai minimum kelulusan adalah ${quiz.passingScore}%.`}
          </p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 20, background: "var(--card-bg)", borderRadius: 14, padding: "16px 32px" }}>
            <div>
              <div style={{ fontSize: 48, fontWeight: 800, color: isPassed ? "#10b981" : "#ef4444" }}>{scorePercent}%</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Nilai Anda</div>
            </div>
            <div style={{ width: 1, height: 50, background: "var(--border-color)" }} />
            <div>
              <div style={{ fontSize: 48, fontWeight: 800, color: "var(--text-secondary)" }}>{quiz.passingScore}%</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Min. Lulus</div>
            </div>
          </div>
        </div>

        {/* Certificate notice */}
        {certificateIssued && (
          <div style={{ background: "#f59e0b22", border: "1px solid #f59e0b", borderRadius: 12, padding: 16, marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24 }}>🏆</span>
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: "var(--text-primary)" }}>Sertifikat telah diterbitkan!</p>
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>Cek halaman sertifikat untuk mengunduh.</p>
            </div>
          </div>
        )}

        {/* Answer review */}
        <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Review Jawaban</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {quiz.questions.map((q, idx) => {
            const ans = answerMap[q.id];
            const isCorrect = ans?.isCorrect;
            const selectedOpt = q.options.find((o) => o.id === ans?.optionId);
            const correctOpt = q.options.find((o) => {
              return false;
            });

            return (
              <div key={q.id} style={{ background: "var(--card-bg)", border: `2px solid ${isCorrect ? "#10b981" : "#ef4444"}`, borderRadius: 12, padding: 20 }}>
                <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                  <span style={{ background: isCorrect ? "#10b98122" : "#ef444422", color: isCorrect ? "#10b981" : "#ef4444", borderRadius: 6, padding: "2px 10px", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                    {isCorrect ? "✓ Benar" : "✗ Salah"}
                  </span>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>+{q.points} poin</span>
                </div>
                <p style={{ margin: "0 0 12px", color: "var(--text-primary)", fontWeight: 500 }}>
                  {idx + 1}. {q.text}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {q.options.map((opt) => {
                    const isSelected = opt.id === ans?.optionId;
                    let bg = "var(--bg-secondary)";
                    let borderColor = "var(--border-color)";
                    if (isSelected && isCorrect) { bg = "#10b98122"; borderColor = "#10b981"; }
                    if (isSelected && !isCorrect) { bg = "#ef444422"; borderColor = "#ef4444"; }

                    return (
                      <div key={opt.id} style={{ padding: "10px 14px", borderRadius: 8, border: `1px solid ${borderColor}`, background: bg, display: "flex", alignItems: "center", gap: 8 }}>
                        {isSelected && <span>{isCorrect ? "✓" : "✗"}</span>}
                        <span style={{ fontSize: 14, color: "var(--text-primary)" }}>{opt.text}</span>
                      </div>
                    );
                  })}
                </div>
                {q.explanation && (
                  <div style={{ marginTop: 12, padding: "10px 14px", background: "#6366f122", borderRadius: 8, borderLeft: "3px solid #6366f1" }}>
                    <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>
                      <strong style={{ color: "#6366f1" }}>Penjelasan:</strong> {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
          <button
            onClick={() => router.push(`/courses/${courseId}`)}
            style={{ flex: 1, background: "var(--accent-primary)", color: "#fff", border: "none", borderRadius: 10, padding: "14px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}
          >
            Kembali ke Kursus
          </button>
          {!isPassed && (
            <button
              onClick={() => { setAnswers({}); setResult(null); setPhase("intro"); }}
              style={{ flex: 1, background: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: 10, padding: "14px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}
            >
              Coba Lagi
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}
