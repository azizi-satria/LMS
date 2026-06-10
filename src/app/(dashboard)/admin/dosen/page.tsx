"use client";

import { useState, useEffect } from "react";

interface DosenUser {
  id: string;
  name: string;
  email: string;
  nip?: string;
  isVerified: boolean;
  createdAt: string;
}

export default function AdminDosenPage() {
  const [tab, setTab] = useState<"pending" | "verified">("pending");
  const [users, setUsers] = useState<DosenUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const load = (t: "pending" | "verified") => {
    setLoading(true);
    fetch(`/api/admin/dosen?status=${t}`)
      .then((r) => r.json())
      .then((d) => { setUsers(Array.isArray(d) ? d : []); setLoading(false); });
  };

  useEffect(() => { load(tab); }, [tab]);

  const handleAction = async (id: string, action: "approve" | "reject", name: string) => {
    const msg = action === "approve"
      ? `Setujui pendaftaran ${name}?`
      : `Tolak dan hapus akun ${name}? Ini tidak bisa dibatalkan.`;
    if (!confirm(msg)) return;
    setProcessing(id);
    const res = await fetch(`/api/admin/dosen/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (res.ok) {
      showToast(data.message, true);
      load(tab);
    } else {
      showToast(data.error || "Gagal memproses.", false);
    }
    setProcessing(null);
  };

  return (
    <div style={{ padding: "32px 24px", maxWidth: 800 }}>
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 100, padding: "12px 20px", borderRadius: 12, background: toast.ok ? "#10b981" : "#ef4444", color: "#fff", fontWeight: 600, fontSize: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
          {toast.ok ? "✓ " : "✗ "}{toast.msg}
        </div>
      )}

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px" }}>Verifikasi Dosen/Pemateri</h1>
        <p style={{ color: "var(--text-secondary)", margin: 0 }}>Setujui atau tolak pendaftaran akun dosen/pemateri</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 24, background: "var(--bg-secondary)", borderRadius: 10, padding: 4 }}>
        {(["pending", "verified"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{ flex: 1, padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, background: tab === t ? "var(--accent-primary)" : "transparent", color: tab === t ? "#fff" : "var(--text-secondary)", transition: "all 0.2s" }}
          >
            {t === "pending" ? "⏳ Menunggu Persetujuan" : "✓ Sudah Disetujui"}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-secondary)" }}>Memuat...</div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 14 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>{tab === "pending" ? "🎉" : "👩‍🏫"}</div>
          <p style={{ color: "var(--text-secondary)" }}>
            {tab === "pending" ? "Tidak ada pendaftaran yang menunggu persetujuan." : "Belum ada dosen yang disetujui."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {users.map((u) => (
            <div key={u.id} style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 14, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: "var(--text-primary)" }}>{u.name}</p>
                      <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>{u.email}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--text-secondary)", marginTop: 8, paddingLeft: 50 }}>
                    {u.nip && <span>NIP: <strong style={{ color: "var(--text-primary)" }}>{u.nip}</strong></span>}
                    <span>Daftar: {new Date(u.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                  </div>
                </div>
                {tab === "pending" && (
                  <div style={{ display: "flex", gap: 8, flexShrink: 0, marginLeft: 16 }}>
                    <button
                      onClick={() => handleAction(u.id, "reject", u.name)}
                      disabled={processing === u.id}
                      style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #ef4444", background: "#ef444411", color: "#ef4444", cursor: "pointer", fontWeight: 600, fontSize: 13 }}
                    >
                      Tolak
                    </button>
                    <button
                      onClick={() => handleAction(u.id, "approve", u.name)}
                      disabled={processing === u.id}
                      style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "var(--accent-primary)", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13, opacity: processing === u.id ? 0.7 : 1 }}
                    >
                      {processing === u.id ? "Memproses..." : "Setujui"}
                    </button>
                  </div>
                )}
                {tab === "verified" && (
                  <span style={{ padding: "4px 12px", borderRadius: 20, background: "#10b98122", color: "#10b981", fontSize: 13, fontWeight: 600 }}>✓ Terverifikasi</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
