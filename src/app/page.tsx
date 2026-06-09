import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-blue-600 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <span className="text-white text-xl font-bold">LMS Universitas</span>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-blue-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Masuk</Link>
              <Link href="/register" className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md text-sm font-medium">Daftar</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Platform Pembelajaran<br />
            <span className="text-blue-200">Digital Kampus</span>
          </h1>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Sistem manajemen pembelajaran yang memudahkan dosen dan mahasiswa dalam proses belajar mengajar secara digital.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg text-lg font-semibold shadow-lg">Mulai Sekarang</Link>
            <Link href="/login" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold">Masuk</Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Fitur Unggulan</h2>
          <p className="text-lg text-gray-600">Semua yang Anda butuhkan untuk pembelajaran digital yang efektif</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Manajemen Kursus</h3>
            <p className="text-gray-600">Dosen dapat membuat dan mengelola kursus dengan modul dan materi pembelajaran yang terstruktur.</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Progress Tracking</h3>
            <p className="text-gray-600">Mahasiswa dapat memantau kemajuan belajar mereka secara real-time untuk setiap materi kursus.</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Multi-Role System</h3>
            <p className="text-gray-600">Sistem berbasis peran untuk Admin, Dosen, dan Mahasiswa dengan akses yang disesuaikan.</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-3 gap-8 text-center text-white">
          <div><div className="text-4xl font-bold mb-2">100+</div><div className="text-blue-200">Kursus Tersedia</div></div>
          <div><div className="text-4xl font-bold mb-2">500+</div><div className="text-blue-200">Mahasiswa Aktif</div></div>
          <div><div className="text-4xl font-bold mb-2">50+</div><div className="text-blue-200">Dosen Pengajar</div></div>
        </div>
      </div>

      <footer className="bg-gray-900 text-gray-400 py-10 text-center">
        <p className="text-sm">© 2024 LMS Universitas. Sistem Manajemen Pembelajaran Digital.</p>
      </footer>
    </div>
  );
}
