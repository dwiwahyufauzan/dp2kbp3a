# 🏛️ DP2KBP3A — Sistem Pelaporan Kegiatan Lapangan Terpadu

Sistem Informasi Manajemen Pelaporan Kegiatan Lapangan Terpadu untuk **Dinas Pengendalian Penduduk, Keluarga Berencana, Pemberdayaan Perempuan dan Perlindungan Anak (DP2KBP3A)**.

Aplikasi ini dirancang khusus untuk mendigitalisasi, mengotomatisasi, dan mengintegrasikan seluruh proses pelaporan kegiatan operasional dari petugas lapangan hingga ke meja pimpinan secara real-time.

---

## 🎨 Tampilan Aplikasi (Preview)

| Halaman Dashboard | Halaman Buat Laporan |
|:---:|:---:|
| ![Dashboard](screenshots/dashboard.png) | ![Buat Laporan](screenshots/buat_laporan.png) |

| Halaman Detail & Visual Diff | Halaman Statistik Interaktif |
|:---:|:---:|
| ![Detail Laporan](screenshots/detail_laporan.png) | ![Statistik](screenshots/statistik.png) |

---

## 🏢 Tentang Dinas (DP2KBP3A)

**Dinas Pengendalian Penduduk, Keluarga Berencana, Pemberdayaan Perempuan dan Perlindungan Anak (DP2KBP3A)** adalah instansi pemerintah daerah yang bertanggung jawab menyelenggarakan urusan pemerintahan di bidang:
1.  **Pengendalian Penduduk (PP)**: Memantau dan menganalisis perkembangan kependudukan daerah, menggalakkan penyuluhan berwawasan kependudukan, serta mengelola data kependudukan mikro.
2.  **Keluarga Berencana (KB)**: Mengoordinasikan pendistribusian alat kontrasepsi, pelayanan KB keliling, penyuluhan pencegahan stunting, serta pembinaan kelompok ketahanan keluarga.
3.  **Pemberdayaan Perempuan (PRM)**: Mengembangkan kesetaraan gender, melaksanakan pelatihan keterampilan bagi perempuan, pendampingan hukum dan psikologis bagi korban KDRT, serta meningkatkan partisipasi ekonomi perempuan.
4.  **Perlindungan Anak (PA)**: Menjamin hak tumbuh kembang anak, memfasilitasi Forum Anak Daerah, mewujudkan Kota/Kabupaten Layak Anak (KLA), serta menyelenggarakan pencegahan kekerasan terhadap anak.

Untuk menjangkau masyarakat secara maksimal, instansi memiliki banyak **Petugas Lapangan** (penyuluh KB, petugas pendamping anak, fasilitator bidang) yang tersebar di berbagai kecamatan dan desa. Kehadiran sistem informasi pelaporan terpadu ini menjadi jembatan vital untuk memastikan setiap kegiatan operasional di lapangan terdokumentasi dengan cepat, kredibel, dan akurat.

---

## 🖥️ Tentang Sistem

Sebelum adanya sistem ini, pelaporan kegiatan lapangan dilakukan secara manual melalui aplikasi pesan instan atau dokumen fisik. Hal tersebut memicu beberapa kendala seperti penumpukan berkas, kesulitan pencarian riwayat data, keterlambatan pelaporan, ketidakakuratan statistik partisipan gender, serta hambatan pimpinan dalam memantau tren efektivitas penyuluhan secara aktual.

**Sistem Pelaporan Kegiatan Lapangan Terpadu** ini hadir sebagai solusi satu pintu (*one-stop solution*) yang menyatukan alur kerja pelaporan:
*   **Petugas Lapangan** mengirim laporan dalam hitungan menit disertai foto dokumentasi terkompresi langsung dari lokasi kegiatan.
*   **Kepala Bidang (Verifikator)** meninjau laporan secara spesifik sesuai bidang kerjanya, memberikan catatan revisi, atau langsung menyetujui laporan.
*   **Pimpinan** memantau visualisasi statistik perkembangan kegiatan dinas, tren peningkatan jumlah peserta, distribusi status laporan, serta melakukan ekspor rekapitulasi data sebagai bahan pengambilan kebijakan.
*   **Administrator** mengatur konfigurasi master data (wilayah tugas, jenis kegiatan, pembagian bidang) serta mengelola akun pengguna dan mengontrol batasan hak akses menu secara dinamis.

---

## ✨ Fitur & Fungsi Utama Sistem

### 1. 📊 Dashboard Interaktif & Key Performance Indicators (KPI)
*   **Ringkasan Statistik**: Menampilkan metrik utama seperti total laporan, total peserta kegiatan, laporan disetujui, dan laporan dalam antrean verifikasi.
*   **Grafik Gender & Status**: Grafik distribusi jumlah peserta berdasarkan jenis kelamin (Laki-laki vs Perempuan) dan diagram donat persentase status verifikasi.
*   **Quick Actions Dinamis**: Jalan pintas cepat yang menyesuaikan dengan peran pengguna (misal: tombol cepat untuk "Buat Laporan Baru" dan "Riwayat Revisian" bagi Petugas Lapangan).
*   **Filter Personal**: Dashboard untuk peran `petugas` secara otomatis disaring sehingga hanya menampilkan statistik performa kegiatannya sendiri, sementara Pimpinan dan Admin melihat data agregat dinas.

### 2. 📝 Modul Laporan Kegiatan & Dokumentasi Fail-Safe
*   **Penginputan Terstruktur**: Form penginputan detail tanggal, lokasi (kecamatan dan desa terintegrasi wilayah kerja), klasifikasi bidang, jenis kegiatan, jumlah peserta laki-laki/perempuan, dan deskripsi naratif.
*   **Kompresi Gambar Pintar**: Setiap foto dokumentasi yang diunggah akan otomatis dikompresi kualitasnya hingga 80% dan ukurannya dibatasi pada lebar/tinggi maksimal 1200px menggunakan library *Sharp*. Hal ini meminimalkan penggunaan penyimpanan server hingga 90% tanpa menurunkan kejelasan foto.
*   **Fail-Safe Mode**: Jika terjadi gangguan pustaka kompresi di server, sistem akan langsung mengaktifkan mode *raw upload* sebagai cadangan agar petugas di lapangan tetap dapat mengirim laporan tanpa kendala teknis.
*   **Mekanisme Soft Deletes**: Laporan yang dihapus oleh admin atau petugas tidak akan benar-benar hilang dari database fisik melainkan ditandai `deleted_at`. Hal ini penting untuk menjaga jejak audit instansi dari kehilangan data yang tidak sengaja.

### 3. 🔍 Pencarian & Filter Laporan Terintegrasi
*   **Pencarian Multi-Kolom**: Memungkinkan pencarian cepat melalui kotak teks utama yang secara cerdas memindai nama kegiatan, detail lokasi, deskripsi kegiatan, maupun nama lengkap petugas lapangan yang mengirimkan laporan.
*   **Multi-Filter**: Filter data laporan berdasarkan Status Verifikasi, Bidang Kerja, dan Jenis Kegiatan secara bersamaan.

### 4. 🔄 Alur Verifikasi & Visual Revision Diff Viewer
*   **Antrean Verifikasi**: Laporan baru masuk dengan status `Pending`. Kepala Bidang dapat memberikan keputusan: `Disetujui`, `Ditolak`, atau `Revisi`.
*   **Visual Perbandingan Revisi**: Ketika petugas mengedit laporan yang diminta direvisi, sistem merekam snapshot data lama. Kepala Bidang dapat meninjau riwayat perubahan melalui tabel perbandingan dinamis yang menyorot perbedaan (nilai lama dicoret merah, nilai baru diwarnai hijau tebal) lengkap dengan nama kolom yang sudah ditranslasikan ke bahasa pengguna.

### 5. 📂 Rekapitulasi & Ekspor Excel Dinamis
*   **Ekspor XLSX**: Pimpinan atau Kepala Bidang dapat mengekspor rekapitulasi data kegiatan ke berkas format Excel (.xlsx) dengan struktur tabel rapi dan profesional (berbantuan *ExcelJS*).
*   **Filter Fleksibel**: Pengeksporan dapat disaring berdasarkan rentang tanggal tertentu, filter bidang, filter petugas tertentu, maupun kecamatan operasional.

### 6. 🔐 Sistem Hak Akses Dinamis (Dynamic Role Permissions)
*   **Menu Berbasis Izin**: Hak akses menu navigasi dan operasi tidak terikat secara kaku pada peran pengguna (*role*).
*   **Konfigurasi Admin**: Administrator dapat secara dinamis menambah atau mencabut izin tertentu untuk masing-masing peran melalui halaman Hak Akses.
*   **Daftar Izin Sistem**:
    *   `buat_laporan`: Izin membuat, memperbarui, dan mengirim laporan kegiatan (Petugas).
    *   `verifikasi_laporan`: Izin menyetujui, menolak, atau meminta revisi laporan (Kabid).
    *   `rekap_laporan`: Izin mengakses halaman rekapitulasi dan mengunduh Excel (Pimpinan, Kabid).
    *   `lihat_statistik`: Izin memantau analitik tren dan dashboard statistik lengkap (Pimpinan, Kabid).
    *   `kelola_master`: Izin menambah/mengubah data bidang kerja, jenis kegiatan, dan wilayah tugas.
    *   `kelola_pengguna`: Izin mengelola akun pengguna (buat, ubah status aktif, ganti kata sandi).
    *   `kelola_hak_akses`: Izin mengatur pemetaan izin ini untuk masing-masing peran.

### 7. 🔔 Notifikasi Real-time & Toast Alerts
*   **Sinkronisasi Aktif**: Siklus pemantauan berkala setiap 15 detik mendeteksi adanya notifikasi baru (seperti laporan disetujui, ditolak, atau perlu direvisi).
*   **Toast Alert Premium**: Memberikan notifikasi pop-up instan dengan visualisasi yang menarik di sudut layar untuk meningkatkan kesadaran operasional pengguna.

---

## 💻 Stack Teknologi

| Komponen | Teknologi | Deskripsi |
|----------|-----------|-----------|
| **Frontend Framework** | SvelteKit 5 | Framework berbasis compiler modern yang menggunakan konsep *Runes* untuk pengelolaan state reaktif berkinerja tinggi. |
| **Styling Engine** | Tailwind CSS v4 | Utilitas styling CSS modern dengan performa build super cepat dan visualisasi modern. |
| **Backend Engine** | Elysia Framework | Framework web Bun yang sangat cepat, efisien, memiliki tipe data aman (*end-to-end type safety*). |
| **Runtime Environment** | Bun | Alternatif runtime JavaScript/TypeScript modern yang jauh lebih cepat dibandingkan Node.js. |
| **Database Engine** | MySQL 8 | Basis data relasional standar industri untuk konsistensi data transaksi pelaporan. |
| **ORM Layer** | Drizzle ORM | Query builder bertipe aman (*TypeScript-first*) yang memastikan kecepatan kueri maksimal. |
| **DevOps & Orkestrasi** | Docker Compose | Mengisolasi frontend, backend, database, dan utilitas backup dalam kontainer Docker. |
| **Daily Backup Tool** | databack/mysql-backup | Mengotomatiskan proses SQL dump database setiap hari untuk pencegahan kehilangan data. |

---

## 📂 Struktur Folder Proyek

```text
DP2KBP3A/                          # Root Folder Workspace
├── backend/                       # BACKEND API (Elysia & Bun)
│   ├── src/
│   │   ├── db/                    # Koneksi database & deklarasi schema Drizzle
│   │   ├── plugins/               # Plugin middleware (contoh: Auth JWT)
│   │   ├── routes/                # Endpoint router (laporan, statistik, admin)
│   │   ├── utils/                 # Helper fungsi (XSS sanitizer, permission checker)
│   │   ├── index.ts               # Titik masuk aplikasi backend Elysia
│   │   └── seed.ts                # Skrip pembuat data awal (seeding)
│   ├── Dockerfile
│   └── package.json
├── database/                      # SQL Skema & Backup Awal
│   └── dp2kbp3a_schema.sql
├── screenshots/                   # Gambar Dokumentasi README
├── src/                           # FRONTEND WEB APP (SvelteKit)
│   ├── lib/
│   │   ├── assets/                # Gambar logo instansi & aset statis
│   │   ├── components/            # Komponen UI Svelte reusable (Sidebar, ConfirmDialog)
│   │   ├── server/                # Modul client API server-side
│   │   ├── stores/                # Global Svelte store (Toast notifications)
│   │   └── types.ts               # Deklarasi tipe TypeScript bersama
│   ├── routes/                    # Halaman & endpoints SvelteKit (App Routing)
│   │   ├── (app)/                 # Rute utama yang memerlukan login (Dashboard, Laporan, Admin)
│   │   ├── login/                 # Rute halaman masuk sistem
│   │   ├── logout/                # Rute aksi keluar sistem
│   │   ├── +layout.server.ts      # Validasi sesi cookie global
│   │   └── +layout.svelte         # Kerangka dasar dashboard utama
│   └── app.html
├── docker-compose.yml             # Konfigurasi orkestrasi kontainer Docker
├── package.json
└── README.md
```

---

## ⚙️ Petunjuk Jalankan Aplikasi

### Opsi A. Menggunakan Docker Compose (Direkomendasikan untuk Produksi & Pengujian Cepat)

Pastikan komputer Anda telah terpasang **Docker Desktop** dan layanan Docker aktif.

1.  Buka terminal pada folder root proyek `DP2KBP3A`.
2.  Jalankan perintah pembangunan kontainer Docker secara background:
    ```bash
    docker compose up --build -d
    ```
3.  Docker akan mengunduh image, membangun kode frontend-backend, menjalankan database MySQL, serta mengaktifkan kontainer backup otomatis.
4.  Akses layanan:
    *   **Frontend Web App**: [http://localhost:5173](http://localhost:5173)
    *   **Backend REST API**: [http://localhost:3000](http://localhost:3000)
    *   **Port MySQL**: `3306` (Username: `root`, Database: `dp2kbp3a`, password dikosongkan untuk lokal).
5.  Setiap berkas foto dokumentasi kegiatan disimpan di folder host `C:\dp2kbp3a-uploads` dan berkas backup harian otomatis disimpan di `C:\dp2kbp3a-backups` di komputer utama Anda (penyimpanan bertahan lama meskipun kontainer dihentikan).

---

### Opsi B. Menjalankan Secara Manual (Development Mode)

#### Prasyarat:
*   [Bun Runtime](https://bun.sh/) terpasang pada komputer Anda.
*   Layanan database MySQL aktif lokal.

#### Langkah 1: Persiapan Database MySQL
1.  Buka klien MySQL Anda (CLI atau GUI seperti DBeaver/HeidiSQL).
2.  Jalankan kueri berikut untuk membuat database baru:
    ```sql
    CREATE DATABASE dp2kbp3a CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ```
3.  Import berkas skema dasar database:
    ```bash
    mysql -u root -p dp2kbp3a < database/dp2kbp3a_schema.sql
    ```

#### Langkah 2: Konfigurasi & Menjalankan Backend API
1.  Masuk ke direktori `backend`:
    ```bash
    cd backend
    ```
2.  Salin konfigurasi env:
    ```bash
    cp .env.example .env
    ```
    *Sesuaikan nilai `DATABASE_URL` jika detail login database lokal Anda berbeda.*
3.  Pasang dependensi dan jalankan proses migrasi awal serta seeding data dasar:
    ```bash
    bun install
    bun run seed
    ```
4.  Aktifkan server backend dalam mode pengembangan:
    ```bash
    bun run dev
    ```

#### Langkah 3: Konfigurasi & Menjalankan Frontend Web
1.  Buka terminal baru di folder root proyek `DP2KBP3A`.
2.  Salin konfigurasi env frontend:
    ```bash
    cp .env.example .env
    ```
3.  Pasang dependensi frontend:
    ```bash
    bun install
    ```
4.  Aktifkan server frontend dalam mode pengembangan:
    ```bash
    bun run dev
    ```
5.  Buka peramban browser Anda di alamat: **http://localhost:5173**

---

## 🔑 Akun Demo Bawaan (Default Seed Accounts)

Setelah proses seeding data dijalankan (`bun run seed`), database akan memiliki 4 akun uji coba yang mewakili masing-masing peran operasional:

| Peran (*Role*) | Alamat Email | Kata Sandi | Kegunaan Uji Coba |
|----------------|--------------|------------|-------------------|
| **Administrator** | `admin@dp2kbp3a.go.id` | `Admin@1234` | Mengelola konfigurasi hak akses izin peran, membuat akun pengguna baru, memodifikasi master data instansi. |
| **Kepala Bidang** | `kepalakb@dp2kbp3a.go.id` | `Admin@1234` | Memverifikasi ajuan laporan dari petugas lapangan, menolak, menyetujui, atau mengirim instruksi revisi. |
| **Petugas Lapangan** | `petugaskb@dp2kbp3a.go.id` | `Admin@1234` | Mengirim data laporan baru, mengunggah foto dokumentasi, melihat antrean revisiannya. |
| **Pimpinan** | `pimpinan@dp2kbp3a.go.id` | `Admin@1234` | Memantau dashboard grafik, melihat statistik dinas keseluruhan, mengunduh berkas rekapitulasi Excel. |

> ⚠️ **PERHATIAN KEAMANAN**: Pastikan Anda segera mengubah kata sandi default di atas pada menu pengaturan profil setelah masuk ke sistem untuk pertama kalinya demi menjaga keamanan data.

---

## 🚀 Alur Kerja Penggunaan Sistem (Role Workflows)

### A. Alur Kerja Administrator
1.  **Masuk Sistem**: Login dengan akun `admin@dp2kbp3a.go.id`.
2.  **Manajemen Wilayah & Kegiatan**: Buka menu **Lokasi Tugas** untuk mendaftarkan kecamatan/desa operasional baru, dan menu **Konfigurasi Jenis** untuk mendaftarkan nama kegiatan per bidang.
3.  **Pembuatan Akun**: Masuk ke menu **Pengguna**, klik **Tambah Pengguna**, isi data profil lengkap, tentukan peran (Admin, Petugas, Kabid, atau Pimpinan) beserta wilayah tugas kinerjanya.
4.  **Kontrol Hak Akses**: Masuk ke menu **Hak Akses**, pilih peran (misal: Petugas Lapangan), centang izin fitur tambahan yang ingin diberikan (misal: memberikan izin `kelola_master` ke petugas agar ia bisa mendaftarkan lokasi baru secara langsung), lalu klik **Simpan Data**.

### B. Alur Kerja Petugas Lapangan
1.  **Masuk Sistem**: Login dengan akun peran petugas.
2.  **Pemantauan Dashboard**: Dashboard menampilkan data statistik personal dari kegiatan yang telah dilaporkan sendiri oleh petugas tersebut.
3.  **Membuat Laporan**: Klik tombol **Buat Laporan**, pilih tanggal kegiatan, pilih kecamatan/desa dari Wilayah Select, isi jumlah peserta laki-laki/perempuan, deskripsi narasi kegiatan, unggah 1 atau lebih foto dokumentasi kegiatan, lalu klik **Simpan**. Laporan otomatis berstatus `Pending`.
4.  **Melakukan Revisi**: Jika laporan ditolak oleh Kepala Bidang dan berstatus `Revisi`, petugas dapat masuk ke menu **Riwayat Revisian**, klik laporan terkait untuk melihat catatan revisi dari verifikator, lakukan perbaikan data, lalu kirim ulang laporan.

### C. Alur Kerja Kepala Bidang
1.  **Masuk Sistem**: Login dengan akun peran kepala bidang.
2.  **Peninjauan Laporan**: Buka menu **Verifikasi** untuk melihat antrean laporan kegiatan berstatus `Pending` khusus dari petugas di bawah bidang kerjanya.
3.  **Pengambilan Keputusan**: Klik pada salah satu laporan pending untuk melihat data detail serta dokumentasi foto.
    *   Jika data sudah benar: Klik **Setujui**.
    *   Jika data tidak valid: Klik **Tolak** (sertakan catatan penolakan).
    *   Jika ada kesalahan ketik/kurang berkas: Klik **Minta Revisi** dan isi catatan instruksi perbaikan untuk dibaca petugas.
4.  **Tinjau Hasil Revisi**: Kabid dapat membandingkan data revisi terbaru yang dikirim ulang petugas dengan data lamanya melalui tabel penyorot warna perbedaan visual (*Visual Diff*) sebelum memutuskan untuk menyetujuinya.

### D. Alur Kerja Pimpinan
1.  **Masuk Sistem**: Login dengan akun peran pimpinan.
2.  **Pemantauan Real-time**: Buka halaman **Dashboard** atau **Analitik & Tren** untuk melihat visualisasi data jumlah pelaporan per bulan, tren partisipasi gender, kontribusi keaktifan laporan per bidang, dan rasio status laporan yang disetujui.
3.  **Unduh Rekapitulasi**: Buka menu **Rekapitulasi**, tentukan filter pencarian (misal: merekap kegiatan Bidang Keluarga Berencana khusus di Kecamatan Sukasari selama bulan Juni), tinjau data pada tabel pratinjau, kemudian klik tombol **Ekspor XLSX** untuk mengunduh laporan berformat Excel.

---

## 🔒 Fitur Keamanan, Keandalan & Performa Lanjutan

Untuk menjamin kenyamanan operasional dan meminimalkan celah keamanan siber, sistem ini dirancang dengan pengamanan berlapis:

*   **Pembersihan Input XSS (`sanitizer.ts`)**: Backend memindai request payload secara rekursif dan menghapus tag HTML mencurigakan menggunakan regex pembersih guna mencegah serangan *Cross-Site Scripting* (XSS) pada input deskripsi laporan.
*   **Header Keamanan Global**: Backend menerapkan CORS, Content Security Policy (CSP), HTTP Strict Transport Security (HSTS), X-Frame-Options (proteksi clickjacking), dan X-Content-Type-Options.
*   **Pembatasan Frekuensi (Rate Limiting)**: Membatasi jumlah request per menit untuk setiap IP klien guna menangkal serangan brute-force login dan pembombardiran upload berkas gambar ke server.
*   **In-Memory API Caching**: Cache di sisi server mempercepat pemuatan grafik statistik pimpinan tanpa membebani server database. Cache ini secara otomatis dibersihkan seketika ketika ada aktivitas penulisan laporan baru di database.

---

Hak cipta © 2026 DP2KBP3A. Seluruh hak dilindungi.
