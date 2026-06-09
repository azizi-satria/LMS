"use client";

import { useState, useEffect } from "react";

interface Certificate {
  id: string;
  code: string;
  issuedAt: string;
  course: {
    id: string;
    title: string;
    instructor: { name: string };
  };
}

export default function CertificatesPage() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/certificates")
      .then((r) => r.json())
      .then((data) => { setCerts(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  const downloadCertificate = async (cert: Certificate) => {
    setDownloading(cert.id);
    try {
      const res = await fetch(`/api/certificates/${cert.id}/download`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Sertifikat-${cert.code}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Gagal mengunduh sertifikat.");
    }
    setDownloading(null);
  };

  return (
    <div style={{ padding: "32px 24px", maxWidth: 800 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px" }}>Sertifikat Saya</h1>
        <p style={{ color: "var(--text-secondary)", margin: 0 }}>Sertifikat penyelesaian kursus yang telah Anda raih</p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-secondary)" }}>Memuat...</div>
      ) : certs.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 16 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🏆</div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 8px" }}>Belum ada sertifikat</h3>
          <p style={{ color: "var(--text-secondary)" }}>Selesaikan post-test kursus untuk mendapatkan sertifikat.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
          {certs.map((cert) => (
            <div key={cert.id} style={{ background: "linear-gradient(135deg, var(--card-bg) 0%, var(--bg-secondary) 100%)", border: "1px solid var(--border-color)", borderRadius: 16, padding: 0, overflow: "hidden", position: "relative" }}>
              {/* Gold top bar */}
              <div style={{ height: 6, background: "linear-gradient(90deg, #f59e0b, #d97706)" }} />
              <div style={{ padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <span style={{ fontSize: 32 }}>🏆</span>
                  <span style={{ fontSize: 11, color: "var(--text-secondary)", background: "var(--bg-secondary)", padding: "3px 10px", borderRadius: 20 }}>{cert.code}</span>
                </div>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-secondary)", margin: "0 0 6px" }}>Sertifikat Penyelesaian</p>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 10px", lineHeight: 1.4 }}>{cert.course.title}</h3>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 16px" }}>
                  Instruktur: <strong style={{ color: "var(--text-primary)" }}>{cert.course.instructor.name}</strong>
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                    {new Date(cert.issuedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                  <button
                    onClick={() => downloadCertificate(cert)}
                    disabled={downloading === cert.id}
                    style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: downloading === cert.id ? 0.7 : 1, display: "flex", alignItems: "center", gap: 6 }}
                  >
                    {downloading === cert.id ? "⏳ Mengunduh..." : "⬇ Unduh PDF"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
