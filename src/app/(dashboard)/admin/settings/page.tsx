"use client";

import { useEffect, useState } from "react";

interface Settings {
  bankName: string;
  vaPrefix: string;
  vaExpiryHours: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({ bankName: "BCA Virtual Account", vaPrefix: "8808", vaExpiryHours: 24 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    const res = await fetch("/api/admin/settings");
    if (res.ok) setSettings(await res.json());
    setLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  if (loading) {
    return <div style={{ padding: "2rem", color: "var(--text-secondary)" }}>Memuat...</div>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
          Pengaturan Platform
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Konfigurasi Virtual Account dan pembayaran.
        </p>
      </div>

      <div className="glass-card" style={{ padding: "2rem", maxWidth: "600px" }}>
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>
              Nama Bank / VA
            </label>
            <input
              type="text"
              value={settings.bankName}
              onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
              className="dark-input"
              style={{ width: "100%" }}
              placeholder="contoh: BCA Virtual Account"
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>
              Prefix Nomor VA
            </label>
            <input
              type="text"
              value={settings.vaPrefix}
              onChange={(e) => setSettings({ ...settings, vaPrefix: e.target.value })}
              className="dark-input"
              style={{ width: "100%" }}
              placeholder="contoh: 8808"
              maxLength={8}
            />
            <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginTop: "0.4rem" }}>
              Prefix ini akan ditambahkan di awal setiap nomor VA yang digenerate.
            </p>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <label style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>
              Kadaluarsa VA (jam)
            </label>
            <input
              type="number"
              value={settings.vaExpiryHours}
              onChange={(e) => setSettings({ ...settings, vaExpiryHours: parseInt(e.target.value) || 24 })}
              className="dark-input"
              style={{ width: "100%" }}
              min={1}
              max={168}
            />
            <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginTop: "0.4rem" }}>
              VA akan kadaluarsa setelah {settings.vaExpiryHours} jam sejak dibuat.
            </p>
          </div>

          {/* Preview */}
          <div style={{ background: "var(--glass-bg)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1.25rem", marginBottom: "1.5rem" }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Preview
            </p>
            <p style={{ color: "var(--text-primary)", fontSize: "0.875rem" }}>
              Bank: <strong>{settings.bankName}</strong>
            </p>
            <p style={{ color: "var(--text-primary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              Contoh VA: <code style={{ color: "var(--accent)" }}>{settings.vaPrefix}12345678</code>
            </p>
            <p style={{ color: "var(--text-primary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              Kadaluarsa: <strong>{settings.vaExpiryHours} jam</strong>
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              type="submit"
              disabled={saving}
              className="gradient-btn"
              style={{ padding: "0.7rem 2rem" }}
            >
              {saving ? "Menyimpan..." : "Simpan Pengaturan"}
            </button>
            {saved && (
              <span style={{ color: "#22c55e", fontSize: "0.875rem", fontWeight: 500 }}>
                ✓ Tersimpan
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
