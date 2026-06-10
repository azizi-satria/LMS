"use client";

import { Suspense } from "react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPending = searchParams.get("pending") === "true";
  const isRegistered = searchParams.get("registered") === "true";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      const msg = result.error.includes("PENDING_APPROVAL")
        ? "Akun Anda sedang menunggu persetujuan admin. Silakan tunggu konfirmasi."
        : "Email atau password salah. Silakan coba lagi.";
      setError(msg);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="rounded-2xl p-8" style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {isPending && <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#fbbf24" }}>⏳ Pendaftaran berhasil! Akun Dosen Anda sedang menunggu persetujuan admin. Anda akan bisa login setelah disetujui.</div>}
        {isRegistered && !isPending && <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399" }}>✓ Pendaftaran berhasil! Silakan login.</div>}
        {error && <div className="px-4 py-3 rounded-xl text-sm animate-scale-in" style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#fca5a5" }}>{error}</div>}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "#cbd5e1" }}>Alamat Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="nama@universitas.ac.id" className="dark-input w-full px-4 py-3 rounded-xl text-sm" style={{ color: "#f1f5f9" }} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "#cbd5e1" }}>Kata Sandi</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Masukkan kata sandi" className="dark-input w-full px-4 py-3 rounded-xl text-sm" style={{ color: "#f1f5f9" }} />
        </div>
        <button type="submit" disabled={loading} className="gradient-btn w-full py-3 px-4 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? (<><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Memproses...</>) : "Masuk"}
        </button>
      </form>
      <div className="mt-6 text-center space-y-3">
        <p className="text-sm" style={{ color: "#64748b" }}>Belum punya akun? <Link href="/register" className="font-semibold" style={{ color: "#a855f7" }}>Daftar sekarang</Link></p>
        <Link href="/" className="text-sm block" style={{ color: "#475569" }}>← Kembali ke Beranda</Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: "#0a0a0f" }}>
      <div className="animate-float" style={{ position: "absolute", width: "500px", height: "500px", top: "-150px", left: "-100px", background: "rgba(124, 58, 237, 0.15)", borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none" }} />
      <div className="animate-float-delayed" style={{ position: "absolute", width: "400px", height: "400px", bottom: "-100px", right: "-80px", background: "rgba(6, 182, 212, 0.1)", borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none" }} />
      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)", boxShadow: "0 8px 30px rgba(124, 58, 237, 0.4)" }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "#f1f5f9" }}>Selamat Datang</h1>
              <p style={{ color: "#64748b" }}>Masuk ke akun LMS Anda</p>
            </div>
          </Link>
        </div>
        <Suspense fallback={<div className="rounded-2xl p-8" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
