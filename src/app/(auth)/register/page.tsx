"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "MAHASISWA", nim: "", nip: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    if (formData.password !== formData.confirmPassword) { setError("Kata sandi tidak cocok."); setLoading(false); return; }
    if (formData.password.length < 6) { setError("Kata sandi minimal 6 karakter."); setLoading(false); return; }
    try {
      const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password, role: formData.role, nim: formData.role === "MAHASISWA" ? formData.nim : undefined, nip: formData.role === "DOSEN" ? formData.nip : undefined }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Terjadi kesalahan."); setLoading(false); return; }
      if (formData.role === "DOSEN") {
        router.push("/login?pending=true");
      } else {
        router.push("/login?registered=true");
      }
    } catch { setError("Terjadi kesalahan jaringan."); setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: "#0a0a0f" }}>
      <div className="animate-float-delayed" style={{ position: "absolute", width: "500px", height: "500px", top: "-100px", right: "-100px", background: "rgba(124, 58, 237, 0.12)", borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none" }} />
      <div className="animate-float" style={{ position: "absolute", width: "400px", height: "400px", bottom: "-100px", left: "-80px", background: "rgba(6, 182, 212, 0.1)", borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none" }} />
      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)", boxShadow: "0 8px 30px rgba(124, 58, 237, 0.4)" }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "#f1f5f9" }}>Buat Akun Baru</h1>
              <p style={{ color: "#64748b" }}>Daftar sebagai anggota LMS</p>
            </div>
          </Link>
        </div>
        <div className="rounded-2xl p-8" style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#fca5a5" }}>{error}</div>}
            <div><label className="block text-sm font-medium mb-2" style={{ color: "#cbd5e1" }}>Nama Lengkap</label><input name="name" type="text" value={formData.name} onChange={handleChange} required placeholder="Nama Lengkap Anda" className="dark-input w-full px-4 py-3 rounded-xl text-sm" style={{ color: "#f1f5f9" }} /></div>
            <div><label className="block text-sm font-medium mb-2" style={{ color: "#cbd5e1" }}>Alamat Email</label><input name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="nama@universitas.ac.id" className="dark-input w-full px-4 py-3 rounded-xl text-sm" style={{ color: "#f1f5f9" }} /></div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#cbd5e1" }}>Peran</label>
              <select name="role" value={formData.role} onChange={handleChange} className="dark-input w-full px-4 py-3 rounded-xl text-sm" style={{ color: "#f1f5f9" }}>
                <option value="MAHASISWA" style={{ background: "#111118" }}>Mahasiswa</option>
                <option value="DOSEN" style={{ background: "#111118" }}>Dosen</option>
                <option value="UMUM" style={{ background: "#111118" }}>Umum (Publik)</option>
              </select>
            </div>
            {formData.role === "MAHASISWA" && <div><label className="block text-sm font-medium mb-2" style={{ color: "#cbd5e1" }}>NIM</label><input name="nim" type="text" value={formData.nim} onChange={handleChange} placeholder="Nomor Induk Mahasiswa" className="dark-input w-full px-4 py-3 rounded-xl text-sm" style={{ color: "#f1f5f9" }} /></div>}
            {formData.role === "DOSEN" && <div><label className="block text-sm font-medium mb-2" style={{ color: "#cbd5e1" }}>NIP</label><input name="nip" type="text" value={formData.nip} onChange={handleChange} placeholder="Nomor Induk Pegawai" className="dark-input w-full px-4 py-3 rounded-xl text-sm" style={{ color: "#f1f5f9" }} /></div>}
            <div><label className="block text-sm font-medium mb-2" style={{ color: "#cbd5e1" }}>Kata Sandi</label><input name="password" type="password" value={formData.password} onChange={handleChange} required placeholder="Minimal 6 karakter" className="dark-input w-full px-4 py-3 rounded-xl text-sm" style={{ color: "#f1f5f9" }} /></div>
            <div><label className="block text-sm font-medium mb-2" style={{ color: "#cbd5e1" }}>Konfirmasi Kata Sandi</label><input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required placeholder="Ulangi kata sandi" className="dark-input w-full px-4 py-3 rounded-xl text-sm" style={{ color: "#f1f5f9" }} /></div>
            <button type="submit" disabled={loading} className="gradient-btn w-full py-3 px-4 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
              {loading ? (<><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Mendaftar...</>) : "Daftar"}
            </button>
          </form>
          <div className="mt-6 text-center space-y-3">
            <p className="text-sm" style={{ color: "#64748b" }}>Sudah punya akun? <Link href="/login" className="font-semibold" style={{ color: "#a855f7" }}>Masuk sekarang</Link></p>
            <Link href="/" className="text-sm block" style={{ color: "#475569" }}>← Kembali ke Beranda</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
