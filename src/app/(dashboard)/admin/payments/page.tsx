"use client";

import { useEffect, useState } from "react";
import { Payment } from "@/types";

type PaymentWithRelations = Payment & {
  user: { name: string; email: string };
  course: { title: string; semester: string };
  confirmer?: { name: string } | null;
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentWithRelations[]>([]);
  const [status, setStatus] = useState("PENDING");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, [status]);

  async function fetchPayments() {
    setLoading(true);
    const res = await fetch(`/api/admin/payments?status=${status}`);
    if (res.ok) setPayments(await res.json());
    setLoading(false);
  }

  async function handleAction(paymentId: string, action: "CONFIRMED" | "REJECTED") {
    setSubmitting(paymentId);
    const res = await fetch(`/api/admin/payments/${paymentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) fetchPayments();
    setSubmitting(null);
  }

  function formatCurrency(n: number) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
  }

  function formatDate(d: Date | string) {
    return new Date(d).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
          Manajemen Pembayaran
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Konfirmasi pembayaran Virtual Account dari mahasiswa/umum.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {["PENDING", "CONFIRMED", "REJECTED", "EXPIRED"].map((s) => (
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
      ) : payments.length === 0 ? (
        <div className="glass-card" style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
          Tidak ada pembayaran {status.toLowerCase()}.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Pengguna", "Kursus", "VA Number", "Jumlah", "Tanggal", "Kadaluarsa", "Aksi"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "0.75rem 1rem", color: "var(--text-secondary)", fontSize: "0.8rem", fontWeight: 600, borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "1rem", color: "var(--text-primary)" }}>
                    <div style={{ fontWeight: 500 }}>{p.user.name}</div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{p.user.email}</div>
                  </td>
                  <td style={{ padding: "1rem", color: "var(--text-primary)" }}>
                    <div style={{ fontWeight: 500, maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.course.title}</div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{p.course.semester}</div>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <code style={{ background: "var(--glass-bg)", padding: "0.25rem 0.5rem", borderRadius: "4px", color: "var(--accent)", fontSize: "0.875rem" }}>
                      {p.vaNumber}
                    </code>
                  </td>
                  <td style={{ padding: "1rem", color: "var(--text-primary)", fontWeight: 600 }}>
                    {formatCurrency(p.amount)}
                  </td>
                  <td style={{ padding: "1rem", color: "var(--text-secondary)", fontSize: "0.875rem", whiteSpace: "nowrap" }}>
                    {formatDate(p.createdAt)}
                  </td>
                  <td style={{ padding: "1rem", color: new Date(p.expiredAt) < new Date() ? "#ef4444" : "var(--text-secondary)", fontSize: "0.875rem", whiteSpace: "nowrap" }}>
                    {formatDate(p.expiredAt)}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {p.status === "PENDING" ? (
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          onClick={() => handleAction(p.id, "CONFIRMED")}
                          disabled={submitting === p.id}
                          className="gradient-btn"
                          style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem" }}
                        >
                          Konfirmasi
                        </button>
                        <button
                          onClick={() => handleAction(p.id, "REJECTED")}
                          disabled={submitting === p.id}
                          style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", borderRadius: "6px", border: "1px solid #ef4444", background: "transparent", color: "#ef4444", cursor: "pointer" }}
                        >
                          Tolak
                        </button>
                      </div>
                    ) : (
                      <span style={{
                        padding: "0.25rem 0.75rem",
                        borderRadius: "20px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background: p.status === "CONFIRMED" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)",
                        color: p.status === "CONFIRMED" ? "#22c55e" : "#ef4444",
                      }}>
                        {p.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
