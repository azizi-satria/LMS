import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f", color: "#f1f5f9" }}>
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: "rgba(10, 10, 15, 0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="font-bold text-lg" style={{ color: "#f1f5f9" }}>LMS Universitas</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="px-4 py-2 rounded-lg text-sm font-medium" style={{ color: "#94a3b8" }}>Masuk</Link>
              <Link href="/register" className="px-4 py-2 rounded-lg text-sm font-semibold gradient-btn">Daftar</Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="orb orb-purple animate-float" style={{ width: "500px", height: "500px", top: "-100px", left: "-100px" }} />
        <div className="orb orb-cyan animate-float-delayed" style={{ width: "400px", height: "400px", top: "100px", right: "-50px" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8" style={{ background: "rgba(124, 58, 237, 0.15)", border: "1px solid rgba(124, 58, 237, 0.3)", color: "#a855f7" }}>
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
              Platform Pembelajaran Digital Terdepan
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span style={{ color: "#f1f5f9" }}>Platform Belajar</span><br />
              <span className="gradient-text animate-gradient">Digital Kampus</span>
            </h1>
            <p className="text-xl mb-10 max-w-2xl mx-auto" style={{ color: "#94a3b8" }}>Sistem manajemen pembelajaran modern yang memudahkan dosen dan mahasiswa dalam proses belajar mengajar secara digital.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="gradient-btn px-8 py-4 rounded-xl text-lg font-semibold inline-block">Mulai Sekarang</Link>
              <Link href="/login" className="px-8 py-4 rounded-xl text-lg font-semibold inline-block" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f1f5f9" }}>Masuk →</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div style={{ background: "rgba(255,255,255,0.03)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-3 gap-8 text-center">
              {[{ number: "100+", label: "Kursus Tersedia", color: "#a855f7" }, { number: "500+", label: "Mahasiswa Aktif", color: "#06b6d4" }, { number: "50+", label: "Dosen Pengajar", color: "#10b981" }].map((stat) => (
                <div key={stat.label}>
                  <div className="text-4xl font-bold mb-2" style={{ color: stat.color }}>{stat.number}</div>
                  <div style={{ color: "#64748b" }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#f1f5f9" }}>Fitur <span className="gradient-text">Unggulan</span></h2>
            <p style={{ color: "#64748b" }}>Semua yang Anda butuhkan untuk pembelajaran digital yang efektif</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Manajemen Kursus", desc: "Dosen dapat membuat dan mengelola kursus dengan modul dan materi pembelajaran yang terstruktur.", color: "#a855f7", colorBg: "rgba(168, 85, 247, 0.1)" },
              { title: "Progress Tracking", desc: "Mahasiswa dapat memantau kemajuan belajar mereka secara real-time untuk setiap materi kursus.", color: "#06b6d4", colorBg: "rgba(6, 182, 212, 0.1)" },
              { title: "Multi-Role System", desc: "Sistem berbasis peran untuk Admin, Dosen, dan Mahasiswa dengan akses yang disesuaikan.", color: "#10b981", colorBg: "rgba(16, 185, 129, 0.1)" },
            ].map((f) => (
              <div key={f.title} className="glass-card-hover p-8">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ background: f.colorBg }}>
                  <div className="w-6 h-6 rounded-full" style={{ background: f.color }} />
                </div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: "#f1f5f9" }}>{f.title}</h3>
                <p style={{ color: "#64748b" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 text-center relative">
          <div className="rounded-3xl p-12" style={{ background: "rgba(124, 58, 237, 0.08)", border: "1px solid rgba(124, 58, 237, 0.2)" }}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#f1f5f9" }}>Siap Mulai Belajar?</h2>
            <p className="text-lg mb-8" style={{ color: "#94a3b8" }}>Bergabunglah dengan ribuan mahasiswa yang sudah menggunakan platform kami.</p>
            <Link href="/register" className="gradient-btn px-10 py-4 rounded-xl text-lg font-semibold inline-block">Daftar Gratis Sekarang</Link>
          </div>
        </div>
      </section>

      <footer className="py-10" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", color: "#64748b" }}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm">© 2024 LMS Universitas. Sistem Manajemen Pembelajaran Digital.</p>
        </div>
      </footer>
    </div>
  );
}
