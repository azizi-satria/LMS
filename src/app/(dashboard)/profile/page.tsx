"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  nim: string | null;
  nip: string | null;
  createdAt: string;
  _count: { enrollments: number; courses: number };
}

const cardStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid #1e1e2e",
  borderRadius: "16px",
};

const roleLabels: Record<string, string> = {
  ADMIN: "Administrator",
  DOSEN: "Dosen",
  MAHASISWA: "Mahasiswa",
};

const roleColors: Record<string, { bg: string; color: string; border: string }> = {
  ADMIN: { bg: "rgba(239,68,68,0.12)", color: "#f87171", border: "rgba(239,68,68,0.25)" },
  DOSEN: { bg: "rgba(168,85,247,0.12)", color: "#c084fc", border: "rgba(168,85,247,0.25)" },
  MAHASISWA: { bg: "rgba(16,185,129,0.12)", color: "#34d399", border: "rgba(16,185,129,0.25)" },
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [completedMaterials, setCompletedMaterials] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile(data.user);
          setCompletedMaterials(data.completedMaterials);
          setEditName(data.user.name);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError("");

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile((prev) => prev ? { ...prev, name: data.name } : null);
        await update({ name: data.name });
        setSaveSuccess(true);
        setEditing(false);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const err = await res.json();
        setSaveError(err.error || "Terjadi kesalahan");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: "#7c3aed" }} />
      </div>
    );
  }

  if (!profile) return null;

  const rs = roleColors[profile.role] || roleColors.MAHASISWA;

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "#f1f5f9" }}>Profil Saya</h1>
        <p className="mt-1" style={{ color: "#64748b" }}>Kelola informasi profil Anda</p>
      </div>

      <div style={cardStyle} className="p-8 mb-6">
        <div className="flex items-start gap-6">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
              color: "white",
              boxShadow: "0 8px 30px rgba(124,58,237,0.4)",
            }}
          >
            {getInitials(profile.name)}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold" style={{ color: "#f1f5f9" }}>{profile.name}</h2>
                <p className="mt-0.5" style={{ color: "#64748b" }}>{profile.email}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{ background: rs.bg, color: rs.color, border: `1px solid ${rs.border}` }}
                  >
                    {roleLabels[profile.role]}
                  </span>
                  {(profile.nim || profile.nip) && (
                    <span className="text-sm" style={{ color: "#64748b" }}>
                      {profile.role === "MAHASISWA" ? `NIM: ${profile.nim}` : `NIP: ${profile.nip}`}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setEditing(!editing)}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: "rgba(124,58,237,0.12)",
                  color: "#a855f7",
                  border: "1px solid rgba(124,58,237,0.25)",
                }}
              >
                {editing ? "Batal" : "Edit Profil"}
              </button>
            </div>
          </div>
        </div>

        {editing && (
          <form onSubmit={handleSaveName} className="mt-6 space-y-4">
            <div
              className="h-px"
              style={{ background: "rgba(255,255,255,0.06)" }}
            />
            <h3 className="font-semibold" style={{ color: "#f1f5f9" }}>Edit Nama</h3>

            {saveSuccess && (
              <div
                className="px-4 py-3 rounded-xl text-sm"
                style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399" }}
              >
                Nama berhasil diperbarui!
              </div>
            )}
            {saveError && (
              <div
                className="px-4 py-3 rounded-xl text-sm"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}
              >
                {saveError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#cbd5e1" }}>
                Nama Lengkap
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="dark-input w-full px-4 py-3 rounded-xl text-sm"
                style={{ color: "#f1f5f9" }}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="gradient-btn px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
              <button
                type="button"
                onClick={() => { setEditing(false); setEditName(profile.name); setSaveError(""); }}
                className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#94a3b8",
                }}
              >
                Batal
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="grid grid-cols-3 gap-5 mb-6">
        {profile.role === "MAHASISWA" && (
          <>
            <div
              className="p-6 rounded-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(6,182,212,0.06))",
                border: "1px solid rgba(124,58,237,0.15)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: "rgba(168,85,247,0.15)", color: "#a855f7" }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-2xl font-bold" style={{ color: "#f1f5f9" }}>{profile._count.enrollments}</p>
              <p className="text-sm mt-1" style={{ color: "#64748b" }}>Kursus Diikuti</p>
            </div>
            <div
              className="p-6 rounded-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(6,182,212,0.08), rgba(16,185,129,0.06))",
                border: "1px solid rgba(6,182,212,0.15)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: "rgba(6,182,212,0.15)", color: "#06b6d4" }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <p className="text-2xl font-bold" style={{ color: "#f1f5f9" }}>{completedMaterials}</p>
              <p className="text-sm mt-1" style={{ color: "#64748b" }}>Materi Selesai</p>
            </div>
            <div
              className="p-6 rounded-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(124,58,237,0.06))",
                border: "1px solid rgba(16,185,129,0.15)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm font-bold" style={{ color: "#f1f5f9" }}>
                {new Date(profile.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </p>
              <p className="text-sm mt-1" style={{ color: "#64748b" }}>Bergabung Sejak</p>
            </div>
          </>
        )}

        {profile.role === "DOSEN" && (
          <>
            <div
              className="p-6 rounded-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(6,182,212,0.06))",
                border: "1px solid rgba(124,58,237,0.15)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: "rgba(168,85,247,0.15)", color: "#a855f7" }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-2xl font-bold" style={{ color: "#f1f5f9" }}>{profile._count.courses}</p>
              <p className="text-sm mt-1" style={{ color: "#64748b" }}>Kursus Dibuat</p>
            </div>
            <div
              className="p-6 rounded-2xl col-span-2"
              style={{
                background: "linear-gradient(135deg, rgba(6,182,212,0.08), rgba(124,58,237,0.06))",
                border: "1px solid rgba(6,182,212,0.15)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: "rgba(6,182,212,0.15)", color: "#06b6d4" }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm font-bold" style={{ color: "#f1f5f9" }}>
                {new Date(profile.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </p>
              <p className="text-sm mt-1" style={{ color: "#64748b" }}>Bergabung Sejak</p>
            </div>
          </>
        )}

        {profile.role === "ADMIN" && (
          <div
            className="p-6 rounded-2xl col-span-3"
            style={{
              background: "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(124,58,237,0.06))",
              border: "1px solid rgba(239,68,68,0.15)",
            }}
          >
            <p className="text-sm font-medium" style={{ color: "#94a3b8" }}>
              Bergabung pada{" "}
              <span style={{ color: "#f1f5f9" }}>
                {new Date(profile.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </p>
          </div>
        )}
      </div>

      <div style={cardStyle} className="p-6">
        <h3 className="font-semibold mb-4" style={{ color: "#f1f5f9" }}>Informasi Akun</h3>
        <div className="space-y-4">
          {[
            { label: "Email", value: profile.email },
            { label: "Peran", value: roleLabels[profile.role] },
            ...(profile.nim ? [{ label: "NIM", value: profile.nim }] : []),
            ...(profile.nip ? [{ label: "NIP", value: profile.nip }] : []),
            {
              label: "Bergabung",
              value: new Date(profile.createdAt).toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              }),
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between py-3"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
            >
              <span className="text-sm" style={{ color: "#64748b" }}>{label}</span>
              <span className="text-sm font-medium" style={{ color: "#e2e8f0" }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
