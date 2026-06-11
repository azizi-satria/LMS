// ════════════════════════════════════════════
// LEVEL & SCENE DATA — NetAdmin Academy v6
// ════════════════════════════════════════════

const LEVELS = [

  // LEVEL 1
  {
    id: 1, title: "Hari Pertama Magang",
    mission: "Selesaikan orientasi & tangani krisis server pertamamu",
    badge: "🔧 Magang Heroik", startScene: "lobby",
    scenes: {
      lobby: { type: "corridor", label: "🏢 Lantai 3 — Ruang Tunggu IT", doorSign: "SERVER ROOM A", chars: [{ id: "pak-heri", name: "Pak Heri" }] },
      serverroom: { type: "serverroom", label: "🖥️ Server Room A — Netville", chars: [{ id: "kak-sari", name: "Kak Sari" }], objects: [ { id: "server-rack", label: "Server Rack Utama" }, { id: "monitor", label: "Monitor Error Log" }, { id: "sticky-note", label: "Catatan Pak Heri" }, { id: "router", label: "Router Jaringan" }, { id: "usb-log", label: "USB Backup Log" } ] }
    },
    dialogs: {
      char_pak_heri: [
        { avatar: "😅", name: "Andi (Kamu)", text: "Bismillah... *tarik napas* Ini dia, Dinas IT Kota Netville. Hari pertama magang!" },
        { avatar: "😊", name: "Pak Heri", text: "Oh! Kamu pasti Andi dari SMK TKJ! Selamat datang! Aku Pak Heri, Kepala Divisi IT kota ini." },
        { avatar: "😊", name: "Pak Heri", text: "Di divisi kami, tugas kami menjaga seluruh infrastruktur IT kota — website pemerintah, database kependudukan, jaringan semua kantor..." },
        { avatar: "😊", name: "Pak Heri", text: "Kamu akan belajar banyak selama magang di sini. Oh ya, partnermu sudah menunggu di server room — namanya Kak Sari, senior sysadmin kita yang paling jago!" },
        { avatar: "😅", name: "Andi (Kamu)", text: "Wah, keren sekali, Pak! Saya siap belajar! Boleh langsung ke server room?" },
        { avatar: "😊", name: "Pak Heri", text: "Tentu! Pintu server room ada di ujung lorong ini. Kenalan dulu sama Sari — dia yang akan guide kamu selama magang. Selamat bekerja, Andi!" }
      ],
      char_kak_sari: [
        { avatar: "😎", name: "Kak Sari", text: "Eh, kamu pasti Andi? Halo! Aku Sari. Selamat datang di server room — ini 'jantungnya' IT kota!", lookDir: "forward" },
        { avatar: "😎", name: "Kak Sari", text: "*menunjuk ke kiri* Lihat deretan rack di sisi kiri — itu Production Servers. Server web, database, email, semua layanan kota yang jalan 24/7 ada di sana.", lookDir: "production" },
        { avatar: "😎", name: "Kak Sari", text: "LED hijau yang kedap-kedip itu tanda server aktif normal. Kalau ada yang merah atau mati — itu darurat, kita harus respons dalam menit!", lookDir: "production" },
        { avatar: "😎", name: "Kak Sari", text: "*menunjuk ke kanan* Nah sisi kanan ini — Backup Servers dan storage. Ini 'jaring pengaman' kita. Kalau production down, data tetap aman di sini.", lookDir: "backup" },
        { avatar: "😎", name: "Kak Sari", text: "*menunjuk ke meja di depan* Workstation ini pusat kendali kita. Dari sini kita SSH ke semua server, monitor log, jalankan command Linux. Ini komputer operatornya.", lookDir: "workstation" },
        { avatar: "😅", name: "Andi (Kamu)", text: "Wah... keren banget Kak! Saya di sekolah baru belajar dasar Linux saja.", lookDir: "forward" },
        { avatar: "😎", name: "Kak Sari", text: "Bagus! Di sini kamu langsung praktek di sistem nyata. Teori dari sekolah kamu akan terasa beda ketika dipakai sungguhan—", lookDir: "forward" },
        { avatar: "📞", name: "[ ☎  TELPON MASUK — PAK HERI ]", text: "BRRINGGG!! BRRINGGG!! BRRINGGG!!", lookDir: "up" },
        { avatar: "😱", name: "Pak Heri (via telepon)", text: "SARI!! Server web SMKN 1 DOWN! Ujian online 800 siswa mulai 2 jam lagi! Disk penuh, Apache crash! Wali Kota sudah telepon 3 kali!!", lookDir: "up" },
        { avatar: "😎", name: "Kak Sari", text: "*tutup telepon, ekspresi serius* Oke Andi. Situasi NYATA baru saja datang. Tidak ada waktu untuk latihan dulu.", lookDir: "forward" },
        { avatar: "😎", name: "Kak Sari", text: "Langkah pertama: INSPECT semua perangkat. Dekati dan tekan E di setiap item — baca statusnya, kumpulkan informasi. Mulai dari rack production di kiri!", lookDir: "production" },
        { avatar: "😎", name: "Kak Sari", text: "Setelah tahu masalahnya, duduk di workstation ini dan buka terminal dari tombol 💻 di panel Misi. Aku standby di sini kalau butuh bantuan. Let's go!", lookDir: "workstation" }
      ]
    },
    items: {
      "server-rack": { icon: "🖥️", title: "Server Dell PowerEdge — Apache MATI", status: "err", statusText: "Disk 100% — Apache Crash", body: "Status server:\n• Ubuntu Server 22.04 ✓\n• CPU: normal\n• RAM: 4GB / 8GB (OK)\n• Disk /: 100% PENUH ❌\n\nApache tidak bisa tulis log → service crash!\nHarus bersihkan disk sebelum restart Apache.", theory: "Disk 100% adalah salah satu penyebab server down yang paling umum. Service seperti Apache membutuhkan ruang untuk menulis log. Solusi: hapus log lama dengan journalctl --vacuum-size.", triggerTerm: true },
      "monitor": { icon: "🖥", title: "Monitor — Apache Error Log", status: "err", statusText: "Failed to write log", body: "Error terakhir di /var/log/apache2/error.log:\n\n[ALERT] No space left on device!\n[ERROR] apache2: could not open error log file\n[ERROR] AH00015: Unable to open logs\n\nKonfirmasi: disk penuh = Apache mati.", theory: "Apache menyimpan log di /var/log/apache2/. Jika disk penuh, Apache tidak bisa tulis log dan langsung crash. Cek: df -h dan du -sh /var/log/*", triggerTerm: true },
      "sticky-note": { icon: "📝", title: "Catatan Pak Heri — Tempel di Meja", status: "ok", statusText: "📋 Petunjuk Darurat", body: "Langkah darurat:\n1. df -h → cek penggunaan disk\n2. du -sh /var/log/* → cari file terbesar\n3. journalctl --vacuum-size=100M → bersihkan log\n4. systemctl restart apache2\n5. curl http://localhost → test!\n\n— Heri", theory: "", triggerTerm: false },
      "router": { icon: "📡", title: "Router — Jaringan Normal", status: "ok", statusText: "Link UP ✓", body: "Router berjalan normal:\n• Uptime: 47 hari\n• WAN: terhubung ke internet ✓\n• LAN: 192.168.1.1/24\n• Server IP: 192.168.1.100\n\nJaringan bukan masalahnya — masalah di server!", theory: "Langkah troubleshooting: pisahkan dulu masalah jaringan vs masalah server. Jika ping berhasil tapi website tidak bisa dibuka, berarti masalah di server.", triggerTerm: false },
      "usb-log": { icon: "💾", title: "USB — Backup Log Error", status: "warn", statusText: "Log 3 bulan tidak dibersihkan!", body: "Isi USB:\n• error_log_backup_jan.tar.gz (4.2 GB)\n• error_log_backup_feb.tar.gz (3.8 GB)\n• error_log_backup_mar.tar.gz (5.1 GB)\n\nTOTAL: 13 GB log tidak pernah dibersihkan!\nIni penyebab disk penuh.", theory: "Best practice: konfigurasi logrotate untuk otomatis kompres dan hapus log lama. File: /etc/logrotate.conf", triggerTerm: false }
    },
    objectives: [
      { id: "check-disk",     text: "Cek penggunaan disk server",      cmd: "df -h" },
      { id: "check-log-size", text: "Cek ukuran file log",             cmd: "du -sh /var/log/*" },
      { id: "clean-journal",  text: "Bersihkan log sistem",            cmd: "journalctl --vacuum-size=100M" },
      { id: "restart-apache", text: "Restart Apache web server",       cmd: "systemctl restart apache2" },
      { id: "test-web",       text: "Verifikasi website bisa diakses",  cmd: "curl http://localhost" }
    ],
    hints: ["Cek disk dulu: df -h — lihat partisi mana yang penuh.","Bersihkan log sistem: journalctl --vacuum-size=100M","Setelah disk lega, restart Apache: systemctl restart apache2"],
    missionIntro: { title: "🚨 Misi Pertama: Server Web Down!", lines: ["Server web SMKN 1 tidak bisa diakses.","800 siswa akan ujian online dalam 2 jam!","Tugasmu: cek disk, bersihkan log, restart Apache."] },
    summary: { judul: "Server Web Kembali Hidup!", apa: "Kamu membersihkan log sistem Linux yang memenuhi disk, lalu merestart Apache web server.", kenapa: "Server web harus bisa diakses agar ujian online 800 siswa tetap bisa berjalan.", penyebab: "Log sistem yang tidak pernah dibersihkan menumpuk hingga disk 100% penuh. Apache tidak bisa menulis log baru → crash.", pelajaran: "Selalu pantau kapasitas disk server secara rutin. Gunakan journalctl --vacuum-size untuk membatasi ukuran log sistem Linux." }
  },

  // LEVEL 2
  {
    id: 2, title: "Jaringan Mati di Kelurahan",
    mission: "DHCP error — 30 PC kantor lurah tidak dapat IP address!",
    badge: "🔌 Network Fixer", startScene: "lobby",
    scenes: {
      lobby: { type: "corridor", label: "🏢 Dinas IT — Laporan Darurat Masuk", doorSign: "SERVER ROOM B", chars: [{ id: "pak-heri", name: "Pak Heri" },{ id: "pak-lurah", name: "Pak Lurah" }] },
      serverroom: { type: "serverroom", label: "🖥️ Server Room B — Kelurahan Cempaka", chars: [{ id: "kak-sari", name: "Kak Sari" }], objects: [{ id: "switch", label: "Network Switch" },{ id: "dhcp-server", label: "DHCP Server" },{ id: "pc-lab", label: "PC Staf Kantor" },{ id: "ip-diagram", label: "Diagram IP Kantor" },{ id: "error-ticket", label: "Tiket Trouble" }] }
    },
    dialogs: {
      char_pak_heri: [
        { avatar: "😅", name: "Andi (Kamu)", text: "Hari kedua magang. Semoga lebih tenang dari kemarin..." },
        { avatar: "😱", name: "Pak Heri", text: "Andi! Pak Lurah sudah di sini dari tadi pagi. Ada masalah besar di kantor kelurahan!" },
        { avatar: "😤", name: "Pak Lurah", text: "Ini sangat mendesak! Seluruh jaringan kantor kelurahan MATI! 200 warga sudah antri buat KTP — staf tidak bisa akses sistem apapun!" },
        { avatar: "😱", name: "Pak Heri", text: "Sari sudah berangkat duluan ke server room. Andi, pergi sekarang ya! Ini darurat!" },
        { avatar: "😅", name: "Andi (Kamu)", text: "Siap Pak! Saya langsung ke server room!" }
      ],
      char_pak_lurah: [
        { avatar: "😤", name: "Pak Lurah", text: "Hei, kamu yang magang itu ya? Tolong cepat! Antrian warga sudah sangat panjang!" }
      ],
      char_kak_sari: [
        { avatar: "😎", name: "Kak Sari", text: "Andi! Bagus, kamu sudah datang. Masalahnya jelas: DHCP server error.", lookDir: "forward" },
        { avatar: "😎", name: "Kak Sari", text: "*tunjuk server* DHCP server ini yang kasih IP address ke semua PC di kantor. Kalau dia mati, semua PC tidak dapat IP.", lookDir: "production" },
        { avatar: "😎", name: "Kak Sari", text: "Tugasmu: cek status DHCP, perbaiki file konfigurasinya, restart. Inspect dulu semua item ya!", lookDir: "workstation" }
      ]
    },
    items: {
      "switch": { icon: "🔀", title: "Network Switch — Link OK", status: "ok", statusText: "Port aktif semua ✓", body: "Switch Cisco Catalyst 2960:\n• 24 port aktif ✓\n• Jaringan fisik: NORMAL\n\nSwitch bukan masalahnya — cek DHCP server!", theory: "Network switch menghubungkan perangkat dalam LAN. Jika switch normal tapi PC tidak dapat IP, masalah ada di DHCP server.", triggerTerm: false },
      "dhcp-server": { icon: "🌐", title: "DHCP Server — SERVICE MATI", status: "err", statusText: "Service failed to start", body: "Status: isc-dhcp-server FAILED ❌\n\nError: /etc/dhcp/dhcpd.conf line 7: syntax error\n\nKonfigurasi salah → service tidak bisa start", theory: "DHCP server memberikan IP otomatis ke perangkat. File konfigurasi: /etc/dhcp/dhcpd.conf. Jika syntax error, service tidak bisa start.", triggerTerm: true },
      "pc-lab": { icon: "💻", title: "PC Staf Kantor — No IP Address", status: "err", statusText: "169.254.x.x (APIPA)", body: "IP PC staf: 169.254.x.x (APIPA)\n\nArtinya PC TIDAK dapat IP dari DHCP!\nPastikan DHCP server aktif untuk fix ini.", theory: "APIPA = IP 169.254.x.x yang dipakai otomatis ketika perangkat tidak berhasil mendapat IP dari DHCP server.", triggerTerm: false },
      "ip-diagram": { icon: "📊", title: "Diagram IP Kantor Kelurahan", status: "ok", statusText: "Dokumentasi jaringan", body: "Rencana IP Kantor:\n• Router: 192.168.10.1\n• DHCP Range: 192.168.10.50 - 192.168.10.200\n• DNS: 8.8.8.8\n\nConfig DHCP harus sesuai diagram ini!", theory: "Dokumentasi jaringan sangat penting! Selalu catat IP range, subnet mask, default gateway, dan DNS server.", triggerTerm: false },
      "error-ticket": { icon: "🎫", title: "Tiket Laporan — Staf IT Kelurahan", status: "warn", statusText: "Laporan jam 07:30", body: "Semua PC tidak bisa browsing & akses server.\nDiagnosa benar: DHCP server mati!", theory: "Troubleshooting sistematis: selalu isolasi masalah. Kalau hanya satu kantor, masalahnya lokal.", triggerTerm: false }
    },
    objectives: [
      { id: "check-dhcp",   text: "Cek status DHCP server",    cmd: "systemctl status isc-dhcp-server" },
      { id: "edit-dhcp",    text: "Edit konfigurasi DHCP",     cmd: "nano /etc/dhcp/dhcpd.conf" },
      { id: "restart-dhcp", text: "Restart DHCP server",       cmd: "systemctl restart isc-dhcp-server" }
    ],
    hints: ["Cek status: systemctl status isc-dhcp-server","Edit konfigurasi: nano /etc/dhcp/dhcpd.conf","Restart: systemctl restart isc-dhcp-server"],
    missionIntro: { title: "🔌 Misi: DHCP Server Mati!", lines: ["30 PC di kantor lurah tidak dapat IP address.","Semua internet & jaringan lumpuh total!","Tugasmu: cek & perbaiki konfigurasi DHCP server."] },
    summary: { judul: "Jaringan Kelurahan Pulih!", apa: "Kamu memperbaiki konfigurasi DHCP server dan merestart service-nya.", kenapa: "Tanpa DHCP, semua PC di jaringan tidak bisa mendapat IP otomatis dan tidak bisa mengakses internet atau server.", penyebab: "File konfigurasi DHCP (/etc/dhcp/dhcpd.conf) salah diubah sehingga service gagal start.", pelajaran: "DHCP server yang stabil adalah pondasi jaringan. Selalu backup file konfigurasi sebelum mengeditnya." }
  },

  // LEVEL 3
  {
    id: 3, title: "Database Kependudukan Rusak",
    mission: "MySQL crash — data kependudukan ribuan warga tidak bisa diakses!",
    badge: "💾 Database Hero", startScene: "lobby",
    scenes: {
      lobby: { type: "corridor", label: "🏢 Dinas IT — Laporan Disdukcapil", doorSign: "SERVER ROOM C", chars: [{ id: "pak-heri", name: "Pak Heri" },{ id: "bu-retno", name: "Bu Retno" }] },
      serverroom: { type: "serverroom", label: "🖥️ Server Room C — Database Kota", chars: [{ id: "kak-sari", name: "Kak Sari" }], objects: [{ id: "db-server", label: "Database Server MySQL" },{ id: "backup-drive", label: "Hard Drive Backup" },{ id: "error-log", label: "Error Log MySQL" },{ id: "cron-config", label: "Konfigurasi Cron Job" },{ id: "status-board", label: "Status Board IT" }] }
    },
    dialogs: {
      char_pak_heri: [
        { avatar: "😅", name: "Andi (Kamu)", text: "Hari ketiga magang. Mana-mana ada masalah terus di kota ini..." },
        { avatar: "😱", name: "Pak Heri", text: "Andi! Database sistem administrasi kota error besar! Bu Retno dari Disdukcapil sudah menunggu sejak pagi!" },
        { avatar: "😟", name: "Bu Retno", text: "Sistem kami tidak bisa akses database sejak semalam! Besok ada audit dari Kemendagri!" },
        { avatar: "😱", name: "Pak Heri", text: "Sari sudah standby di server room database. Andi, kamu bantu Sari ya!" },
        { avatar: "😅", name: "Andi (Kamu)", text: "Siap, Pak! Saya langsung ke server room!" }
      ],
      char_bu_retno: [ { avatar: "😟", name: "Bu Retno", text: "Tolong ya, Andi. Data warga itu sangat penting. Besok ada audit dan semua dokumen harus bisa diakses." } ],
      char_kak_sari: [
        { avatar: "😎", name: "Kak Sari", text: "Andi, masalah kali ini lebih serius. MySQL database crash karena ada korupsi data.", lookDir: "forward" },
        { avatar: "😎", name: "Kak Sari", text: "*tunjuk server besar* Ini database server utama. MySQL-nya error dan tidak bisa start normal.", lookDir: "production" },
        { avatar: "😎", name: "Kak Sari", text: "Kita harus stop MySQL dulu, jalankan mysqlcheck untuk repair tabel corrupt, baru start lagi.", lookDir: "workstation" },
        { avatar: "😎", name: "Kak Sari", text: "Inspect semua item di sini dulu — terutama error log. Pahami kondisinya sebelum mulai. Hati-hati ya!", lookDir: "racks" }
      ]
    },
    items: {
      "db-server":    { icon: "🗄️", title: "Database Server — MySQL ERROR", status: "err", statusText: "InnoDB: corruption detected", body: "MySQL Server:\n• Status: CRASHED ❌\n• Error: InnoDB table corruption\n• Database: kependudukan_kota\n\nHarus: stop → repair → start", theory: "InnoDB corruption bisa terjadi karena power failure atau disk error. Repair: mysqlcheck --auto-repair --all-databases", triggerTerm: true },
      "backup-drive": { icon: "💾", title: "Hard Drive Backup — 3 Hari Lalu", status: "warn", statusText: "Backup terakhir: 3 hari lalu", body: "Backup tersedia tapi 3 hari lalu.\n⚠️ Lebih baik coba repair dulu sebelum restore!", theory: "Backup rutin: 0 2 * * * mysqldump -u root nama_db > /backup/db_$(date +%F).sql", triggerTerm: false },
      "error-log":    { icon: "📋", title: "Error Log MySQL", status: "err", statusText: "InnoDB: table corruption", body: "[ERROR] InnoDB: Table kependudukan_kota/tb_warga is marked as crashed\n[ERROR] MySQL: Got error 126 from storage engine", theory: "Error log MySQL: /var/log/mysql/error.log. Error 126 = tabel corrupt, perlu direpair.", triggerTerm: false },
      "cron-config":  { icon: "⏰", title: "Konfigurasi Cron Job", status: "warn", statusText: "Tidak ada maintenance terjadwal!", body: "Cron job saat ini: (kosong)\n\nTidak ada backup otomatis!\nTidak ada pembersihan log otomatis!", theory: "Format cron: menit jam hari bulan hari-minggu perintah. Edit dengan: crontab -e", triggerTerm: true },
      "status-board": { icon: "📊", title: "Status Board — Monitoring Kota", status: "err", statusText: "Database: DOWN", body: "✓ Website Kota — OK\n❌ Database Kependudukan — DOWN\n❌ Portal Layanan Warga — ERROR", theory: "Monitoring tools populer: Nagios, Zabbix, Grafana.", triggerTerm: false }
    },
    objectives: [
      { id: "stop-mysql",  text: "Hentikan MySQL service",         cmd: "systemctl stop mysql" },
      { id: "repair-db",   text: "Repair database yang corrupt",   cmd: "mysqlcheck --auto-repair" },
      { id: "start-mysql", text: "Jalankan kembali MySQL",         cmd: "systemctl start mysql" },
      { id: "setup-cron",  text: "Setup cron job maintenance",     cmd: "crontab -e" }
    ],
    hints: ["Stop MySQL dulu: systemctl stop mysql","Repair database: mysqlcheck --auto-repair --all-databases","Setup cron: crontab -e"],
    missionIntro: { title: "💾 Misi: Database Crash!", lines: ["MySQL tidak bisa diakses — data kependudukan ribuan warga terkunci!","Semua aplikasi pelayanan publik lumpuh.","Tugasmu: repair database dan setup backup otomatis."] },
    summary: { judul: "Database Kependudukan Pulih!", apa: "Kamu memperbaiki tabel MySQL yang corrupt menggunakan mysqlcheck, lalu menyiapkan backup otomatis via cron.", kenapa: "Data kependudukan harus selalu tersedia agar layanan publik berjalan.", penyebab: "Proses MySQL terpotong paksa saat mati lampu, menyebabkan tabel database corrupt.", pelajaran: "Selalu aktifkan backup database otomatis dan gunakan UPS untuk server agar tidak mati mendadak." }
  },

  // LEVEL 4
  {
    id: 4, title: "Serangan Siber ke Kota",
    mission: "Website kota diserang! Aktifkan firewall dan blokir penyerang!",
    badge: "🛡️ Cyber Defender", startScene: "lobby",
    scenes: {
      lobby: { type: "corridor", label: "🏢 Dinas IT — Situasi Darurat Siber", doorSign: "SERVER ROOM D", chars: [{ id: "pak-heri", name: "Pak Heri" },{ id: "pak-walikota", name: "Pak Wali Kota" }] },
      serverroom: { type: "serverroom", label: "🖥️ Server Room D — Security Ops", chars: [{ id: "kak-sari", name: "Kak Sari" }], objects: [{ id: "access-log", label: "Access Log Mencurigakan" },{ id: "firewall", label: "Firewall UFW" },{ id: "ids-monitor", label: "Monitor IDS" },{ id: "attack-map", label: "Peta Serangan" },{ id: "patch-notes", label: "Catatan Patch Security" }] }
    },
    dialogs: {
      char_pak_heri: [
        { avatar: "😅", name: "Andi (Kamu)", text: "*lihat berita* 'Website pemerintah kota kena serangan siber'... ini nyata dan itu server kita?!" },
        { avatar: "😰", name: "Pak Heri", text: "ANDI! Website kota sedang diserang sekarang! Traffic abnormal dari ratusan IP luar negeri!" },
        { avatar: "😤", name: "Pak Wali Kota", text: "Ini tidak bisa ditolerir! Website pemerintah kota HARUS aman! Kalau dalam 2 jam belum selesai, saya evaluasi seluruh divisi IT!" },
        { avatar: "😰", name: "Pak Heri", text: "Sari sudah di server room security. Andi — ini misi terpenting sejauh ini!" },
        { avatar: "😤", name: "Andi (Kamu)", text: "Siap, Pak! Saya ke server room sekarang!" }
      ],
      char_pak_walikota: [ { avatar: "😤", name: "Pak Wali Kota", text: "Kamu yang magang itu ya? Aku dengar kamu cukup handal. Jangan kecewakan kota ini!" } ],
      char_kak_sari: [
        { avatar: "😎", name: "Kak Sari", text: "Andi! Situasinya serius — ini serangan DDoS dan brute force sekaligus. Tapi kita bisa handle.", lookDir: "forward" },
        { avatar: "😎", name: "Kak Sari", text: "*tunjuk monitor* Lihat — traffic abnormal dari ratusan IP. Firewall kita belum aktif!", lookDir: "workstation" },
        { avatar: "😎", name: "Kak Sari", text: "Kita pakai UFW firewall. Aktifkan, buka port yang diperlukan, lalu blokir IP penyerang.", lookDir: "workstation" },
        { avatar: "😎", name: "Kak Sari", text: "Inspect access log dan attack map dulu. Pahami polanya baru bertindak!", lookDir: "production" }
      ]
    },
    items: {
      "access-log":  { icon: "📜", title: "Apache Access Log — Mencurigakan", status: "err", statusText: "2847 request/menit dari 1 IP!", body: "185.220.101.45 - 2847 req/mnt ❌\n185.220.101.46 - 1923 req/mnt ❌\n\nNormal: 50-100 req/mnt\nIni DDoS attack!", theory: "DDoS membanjiri server dengan traffic palsu. Cek: cat /var/log/apache2/access.log | awk '{print $1}' | sort | uniq -c | sort -rn", triggerTerm: true },
      "firewall":    { icon: "🔥", title: "UFW Firewall — BELUM AKTIF", status: "err", statusText: "Status: inactive", body: "UFW Firewall: INACTIVE ❌\n\nSemua port terbuka untuk umum!\nIni kenapa serangan bisa masuk.", theory: "UFW: ufw enable, ufw allow 80, ufw deny from [IP], ufw status.", triggerTerm: true },
      "ids-monitor": { icon: "👁️", title: "IDS Monitor — Alert Aktif", status: "warn", statusText: "47 alert keamanan aktif", body: "[HIGH] Port scan dari 185.220.101.45\n[HIGH] SQL injection attempt\n[MED] Brute force SSH\n\n→ Blokir IP HIGH priority dulu!", theory: "IDS memantau traffic dan memberikan alert. Tools: Snort, Suricata, OSSEC.", triggerTerm: false },
      "attack-map":  { icon: "🗺️", title: "Peta Serangan — Sumber IP", status: "err", statusText: "Serangan dari 12 negara", body: "Top sumber: Rusia 45%, China 23%\n\nIP utama: 185.220.101.45, 45.142.212.100", theory: "Incident response: identifikasi sumber → blokir IP → aktifkan proteksi → dokumentasi.", triggerTerm: false },
      "patch-notes": { icon: "📋", title: "Catatan Patch Keamanan", status: "warn", statusText: "38 patch belum diinstall!", body: "Server tidak diupdate sejak 6 bulan!\nIni membuka celah keamanan besar.", theory: "Update rutin: apt update && apt upgrade -y. Aktifkan unattended-upgrades untuk security patch otomatis.", triggerTerm: false }
    },
    objectives: [
      { id: "check-log",  text: "Baca access log mencurigakan",  cmd: "cat /var/log/apache2/access.log" },
      { id: "enable-ufw", text: "Aktifkan firewall UFW",         cmd: "ufw enable" },
      { id: "allow-http", text: "Izinkan traffic HTTP normal",   cmd: "ufw allow 80" },
      { id: "block-ip",   text: "Blokir IP penyerang utama",     cmd: "ufw deny from 185.220.101.45" },
      { id: "check-ufw",  text: "Verifikasi status firewall",    cmd: "ufw status" }
    ],
    hints: ["Cek log: cat /var/log/apache2/access.log","Aktifkan firewall: ufw enable, lalu ufw allow 80","Blokir IP: ufw deny from 185.220.101.45"],
    missionIntro: { title: "🛡️ Misi: Website Kota Diserang!", lines: ["Serangan DDoS dari IP asing menghantam server kota!","Website sudah tidak bisa diakses warga.","Tugasmu: analisis log, aktifkan firewall, blokir penyerang."] },
    summary: { judul: "Serangan Siber Berhasil Diblokir!", apa: "Kamu menganalisis log Apache, mengaktifkan UFW firewall, dan memblokir IP penyerang.", kenapa: "Website pemerintah kota harus aman dan tersedia 24/7.", penyebab: "Firewall tidak dikonfigurasi sehingga IP-IP jahat bisa membanjiri server dengan ribuan request per detik.", pelajaran: "Firewall (UFW/iptables) wajib aktif di server publik. Pantau log akses secara rutin untuk deteksi anomali." }
  },

  // LEVEL 5
  {
    id: 5, title: "Misi Akhir: Bangun Ulang Kota",
    mission: "Deploy ulang semua sistem IT kota — dari nol! Ini momen terbesarmu!",
    badge: "🏆 Master NetAdmin", startScene: "lobby",
    scenes: {
      lobby: { type: "corridor", label: "🏢 Dinas IT — Hari Terakhir PKL", doorSign: "SERVER ROOM UTAMA", chars: [{ id: "pak-heri", name: "Pak Heri" },{ id: "pak-walikota", name: "Pak Wali Kota" }] },
      serverroom: { type: "serverroom", label: "🖥️ Server Room Utama — Full Deployment", chars: [{ id: "kak-sari", name: "Kak Sari" }], objects: [{ id: "main-server", label: "Server Utama Kota" },{ id: "deploy-plan", label: "Rencana Deployment" },{ id: "network-core", label: "Core Network Switch" },{ id: "monitoring", label: "Monitoring Dashboard" },{ id: "checklist", label: "Checklist Deployment" }] }
    },
    dialogs: {
      char_pak_heri: [
        { avatar: "😅", name: "Andi (Kamu)", text: "*tarik napas panjang* Hari terakhir magang. Tidak menyangka sudah sejauh ini..." },
        { avatar: "😊", name: "Pak Heri", text: "Andi! Ini hari terakhir magang kamu sekaligus misi terbesar yang pernah ada di divisi ini!" },
        { avatar: "😊", name: "Pak Wali Kota", text: "Kita akan deploy ulang SELURUH infrastruktur IT kota — lebih kuat, lebih aman! Dan kamu akan jadi bagian dari sejarah ini!" },
        { avatar: "😊", name: "Pak Heri", text: "Sari sudah siapkan server room. Buktikan semua yang sudah kamu pelajari!" },
        { avatar: "😤", name: "Andi (Kamu)", text: "*senyum mantap* Siap, Pak! Dari siswa kikuk hari pertama... sampai di titik ini. Let's go!" }
      ],
      char_pak_walikota: [ { avatar: "😊", name: "Pak Wali Kota", text: "Andi, kota ini berterima kasih. Kamu membuktikan bahwa siswa SMK pun bisa jadi garda terdepan IT pemerintahan!" } ],
      char_kak_sari: [
        { avatar: "😎", name: "Kak Sari", text: "*senyum bangga* Andi... kamu sudah jauh berkembang dari hari pertama. Sekarang, misi terakhir dan terbesar.", lookDir: "forward" },
        { avatar: "😎", name: "Kak Sari", text: "Kita akan deploy ulang seluruh sistem: firewall bersih, jaringan bersih, semua service distart ulang.", lookDir: "production" },
        { avatar: "😎", name: "Kak Sari", text: "*tunjuk whiteboard* Urutan SANGAT penting: Reset firewall → Allow port → Restart networking → Restart service → Verifikasi.", lookDir: "workstation" },
        { avatar: "😎", name: "Kak Sari", text: "Inspect semua perangkat dulu, lalu mulai deployment. Aku percaya kamu!", lookDir: "racks" }
      ]
    },
    items: {
      "main-server":  { icon: "🖥️", title: "Server Utama Kota — Siap Deploy", status: "warn", statusText: "Konfigurasi lama — perlu fresh deploy", body: "Server Dell PowerEdge R740:\n• OS: Ubuntu Server 22.04 LTS ✓\n• RAM: 32GB ✓ | Disk: 2TB ✓\n\nPerlu fresh deployment!", theory: "Full deployment: network → security → services → verification. Dokumentasikan setiap langkah!", triggerTerm: true },
      "deploy-plan":  { icon: "📋", title: "Rencana Deployment — Tahapan", status: "ok", statusText: "Dokumen resmi deployment", body: "Fase 1: Security (reset UFW)\nFase 2: Network (restart networking)\nFase 3: Services (restart semua)\nFase 4: Verification (cek running)", theory: "Deployment plan adalah dokumen wajib sebelum perubahan besar di production.", triggerTerm: false },
      "network-core": { icon: "🔀", title: "Core Network Switch — HP Aruba", status: "ok", statusText: "All links UP ✓", body: "Switch dalam kondisi prima.\nPastikan networking service di server juga di-restart!", theory: "Core switch adalah jantung jaringan. Jangan restart saat jam kerja tanpa koordinasi.", triggerTerm: false },
      "monitoring":   { icon: "📊", title: "Dashboard Monitoring — Real-time", status: "warn", statusText: "5 service belum optimal", body: "✓ MySQL — Running\n✓ Apache — Running\n⚠️ UFW — Konfigurasi lama\n⚠️ Networking — Perlu restart", theory: "Monitoring: systemctl list-units --state=running", triggerTerm: true },
      "checklist":    { icon: "✅", title: "Checklist Deployment Final", status: "ok", statusText: "Panduan langkah demi langkah", body: "□ ufw reset\n□ ufw allow 80\n□ systemctl restart networking\n□ systemctl restart apache2\n□ systemctl list-units --state=running", theory: "Checklist deployment mencegah human error. Setiap langkah harus dicatat dengan timestamp.", triggerTerm: false }
    },
    objectives: [
      { id: "reset-fw",       text: "Reset konfigurasi firewall",        cmd: "ufw reset" },
      { id: "allow-http",     text: "Izinkan traffic HTTP",              cmd: "ufw allow 80" },
      { id: "restart-net",    text: "Restart networking service",        cmd: "systemctl restart networking" },
      { id: "restart-apache", text: "Restart Apache web server",         cmd: "systemctl restart apache2" },
      { id: "check-all",      text: "Verifikasi semua service berjalan", cmd: "systemctl list-units --state=running" }
    ],
    hints: ["Reset firewall dulu: ufw reset, lalu ufw allow 80","Restart networking: systemctl restart networking","Cek semua: systemctl list-units --state=running"],
    missionIntro: { title: "🏆 Misi Akhir: Full Deployment!", lines: ["Seluruh infrastruktur IT kota harus di-deploy ulang dari nol!","Web server, database, jaringan, firewall — semuanya!","Ini ujian terbesarmu sebagai NetAdmin. Buktikan kemampuanmu!"] },
    summary: { judul: "Kota Netville Beroperasi Penuh!", apa: "Kamu berhasil men-deploy ulang seluruh sistem IT kota: web server, database, jaringan, dan keamanan dari nol.", kenapa: "Infrastruktur IT yang andal adalah tulang punggung semua layanan digital pemerintah kota.", penyebab: "Sistem lama sudah usang dan tidak bisa dipatch, diputuskan migrasi total ke infrastruktur baru.", pelajaran: "Seorang sysadmin harus menguasai seluruh stack — jaringan, OS, database, web server, keamanan — untuk bisa deploy dan maintain sistem produksi." }
  }

];
