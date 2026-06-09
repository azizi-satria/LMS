"use client";

import { useEffect, useState } from "react";
import { CourseApproval } from "@/types";

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<CourseApproval[]>([]);
  const [status, setStatus] = useState("PENDING");
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState<CourseApproval | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [finalPrice, setFinalPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchApprovals();
  }, [status]);

  async function fetchApprovals() {
    setLoading(true);
    const res = await fetch(`/api/admin/approvals?status=${status}`);
    if (res.ok) setApprovals(await res.json());
    setLoading(false);
  }

  async function handleReview(action: "APPROVED" | "REJECTED") {
    if (!reviewModal) return;
    setSubmitting(true);
    const res = await fetch(`/api/admin/approvals/${reviewModal.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        adminNotes,
        finalPrice: finalPrice ? parseInt(finalPrice) : undefined,
      }),
    });
    if (res.ok) {
      setReviewModal(null);
      setAdminNotes("");
      setFinalPrice("");
      fetchApprovals();
    }
    setSubmitting(false);
  }

  function formatCurrency(n: number) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
  }

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
          Persetujuan Publikasi
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Review permintaan dosen untuk mempublikasikan kursus ke publik.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {["PENDING", "APPROVED", "REJECTED"].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            style={{
              padding: "0.5rem 1.25rem",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              background: status === s ? "var(--accent)" : "var(--glass-bg)",
              color: status === s ? "#fff" : "var(--text-primary)",
              cursor: "pointer",
              fontWeight: status === s ? 600 : 400,
              fontSize: "0.875rem",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: "var(--text-secondary)", textAlign: "center", padding: "3rem" }}>Memuat...</div>
      ) : approvals.length === 0 ? (
        <div className="glass-card" style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
          Tidak ada permintaan {status.toLowerCase()}.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {approvals.map((a) => (
            <div key={a.id} className="glass-card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ color: "var(--text-primary)", fontWeight: 600, marginBottom: "0.25rem" }}>
                    {(a.course as { title: string })?.title}
                  </h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                    Dosen: {(a.requester as { name: string })?.name} &bull; Semester: {(a.course as { semester: string })?.semester}
                  </p>
                  {a.suggestedPrice !== undefined && a.suggestedPrice !== null && (
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                      Harga diusulkan: <strong style={{ color: "var(--text-primary)" }}>{a.suggestedPrice === 0 ? "Gratis" : formatCurrency(a.suggestedPrice)}</strong>
                    </p>
                  )}
                  {a.requesterNotes && (
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.5rem" }}>
                      Catatan: {a.requesterNotes}
                    </p>
                  )}
                  {a.adminNotes && (
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.5rem" }}>
                      Catatan admin: {a.adminNotes}
                    </p>
                  )}
                  {a.finalPrice !== undefined && a.finalPrice !== null && (
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                      Harga final: <strong style={{ color: "#22c55e" }}>{a.finalPrice === 0 ? "Gratis" : formatCurrency(a.finalPrice)}</strong>
                    </p>
                  )}
                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <span style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "20px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    background: a.status === "PENDING" ? "rgba(234,179,8,0.2)" : a.status === "APPROVED" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)",
                    color: a.status === "PENDING" ? "#eab308" : a.status === "APPROVED" ? "#22c55e" : "#ef4444",
                  }}>
                    {a.status}
                  </span>
                  {a.status === "PENDING" && (
                    <button
                      onClick={() => { setReviewModal(a); setFinalPrice(String(a.suggestedPrice ?? 0)); }}
                      className="gradient-btn"
                      style={{ padding: "0.4rem 1rem", fontSize: "0.875rem" }}
                    >
                      Review
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "1rem" }}>
          <div className="glass-card" style={{ width: "100%", maxWidth: "500px", padding: "2rem" }}>
            <h2 style={{ color: "var(--text-primary)", fontWeight: 700, marginBottom: "1.5rem" }}>
              Review Permintaan
            </h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
              Kursus: <strong style={{ color: "var(--text-primary)" }}>{(reviewModal.course as { title: string })?.title}</strong>
            </p>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                Harga Final (Rp) — isi 0 untuk gratis
              </label>
              <input
                type="number"
                value={finalPrice}
                onChange={(e) => setFinalPrice(e.target.value)}
                className="dark-input"
                style={{ width: "100%" }}
                min={0}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                Catatan Admin (opsional)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="dark-input"
                rows={3}
                style={{ width: "100%", resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button
                onClick={() => setReviewModal(null)}
                style={{ padding: "0.6rem 1.25rem", borderRadius: "8px", border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", cursor: "pointer" }}
              >
                Batal
              </button>
              <button
                onClick={() => handleReview("REJECTED")}
                disabled={submitting}
                style={{ padding: "0.6rem 1.25rem", borderRadius: "8px", border: "none", background: "rgba(239,68,68,0.2)", color: "#ef4444", cursor: "pointer", fontWeight: 600 }}
              >
                Tolak
              </button>
              <button
                onClick={() => handleReview("APPROVED")}
                disabled={submitting}
                className="gradient-btn"
                style={{ padding: "0.6rem 1.25rem" }}
              >
                {submitting ? "Memproses..." : "Setujui"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
