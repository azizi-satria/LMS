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
    setLoading(true);
    setError("");
    if (formData.password !== formData.confirmPassword) { setError("Kata sandi tidak cocok."); setLoading(false); return; }
    if (formData.password.length < 6) { setError("Kata sandi minimal 6 karakter."); setLoading(false); return; }
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password, role: formData.role, nim: formData.role === "MAHASISWA" ? formData.nim : undefined, nip: formData.role === "DOSEN" ? formData.nip : undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Terjadi kesalahan."); setLoading(false); return; }
      router.push("/login?registered=true");
    } catch { setError("Terjadi kesalahan jaringan."); setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Buat Akun Baru</h1>
          <p className="text-gray-500 mt-1">Daftar sebagai anggota LMS</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
            <input name="name" type="text" value={formData.name} onChange={handleChange} required placeholder="Nama Lengkap Anda" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat Email</label>
            <input name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="nama@universitas.ac.id" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Peran</label>
            <select name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="MAHASISWA">Mahasiswa</option>
              <option value="DOSEN">Dosen</option>
            </select>
          </div>
          {formData.role === "MAHASISWA" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">NIM</label>
              <input name="nim" type="text" value={formData.nim} onChange={handleChange} placeholder="Nomor Induk Mahasiswa" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          )}
          {formData.role === "DOSEN" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">NIP</label>
              <input name="nip" type="text" value={formData.nip} onChange={handleChange} placeholder="Nomor Induk Pegawai" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Kata Sandi</label>
            <input name="password" type="password" value={formData.password} onChange={handleChange} required placeholder="Minimal 6 karakter" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Konfirmasi Kata Sandi</label>
            <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required placeholder="Ulangi kata sandi" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors mt-2">
            {loading ? "Mendaftar..." : "Daftar"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">Sudah punya akun? <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">Masuk sekarang</Link></p>
        </div>
        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">← Kembali ke Beranda</Link>
        </div>
      </div>
    </div>
  );
}
