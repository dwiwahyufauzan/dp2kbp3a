# 🏛️ DP2KBP3A — Sistem Pelaporan Kegiatan Lapangan

Sistem Informasi Manajemen Pelaporan Kegiatan Lapangan Terpadu untuk **Dinas Pengendalian Penduduk, Keluarga Berencana, Pemberdayaan Perempuan dan Perlindungan Anak (DP2KBP3A)**.

Aplikasi ini dirancang secara khusus untuk memfasilitasi petugas lapangan dalam mendokumentasikan kegiatan operasional secara akurat, sekaligus mempermudah kepala bidang dan pimpinan dalam memantau, memverifikasi, menganalisis, serta mengekspor rekapitulasi aktivitas secara real-time.

---

## 🎨 Tampilan Aplikasi (Preview)

| Halaman Dashboard | Halaman Buat Laporan |
|:---:|:---:|
| ![Dashboard](screenshots/dashboard.png) | ![Buat Laporan](screenshots/buat_laporan.png) |

| Halaman Detail & Visual Diff | Halaman Statistik Interaktif |
|:---:|:---:|
| ![Detail Laporan](screenshots/detail_laporan.png) | ![Statistik](screenshots/statistik.png) |

---

## ✨ Fitur Unggulan & Arsitektur Lanjutan

Sistem ini telah dilengkapi dengan standar arsitektur modern untuk memastikan keandalan, keamanan, dan performa jangka panjang:

### 1. 🔄 Visual Revision Diff Viewer
*   **Perbandingan Sebelum/Sesudah**: Setiap kali petugas mengedit laporan, sistem menyimpan snapshot data lama. Riwayat perubahan disajikan dalam tabel komparasi interaktif yang menyorot perbedaan secara visual.
*   **Warna & Coretan Kontras**: Nilai lama dicoret dan diberi warna merah (`line-through red`), sedangkan nilai baru diwarnai hijau tebal.
*   **Translasi Label**: Mengubah nama kunci database teknis menjadi label ramah pengguna (misalnya: `jumlahPeserta` diterjemahkan menjadi "Total Peserta").

### 2. ⚡ In-Memory Cache untuk Statistik & Grafik
*   **Akselerasi Pemuatan**: Menghindari query database yang berat secara berulang-ulang dengan menaruh data grafik `/statistik` di dalam memory cache backend dengan TTL (Time-To-Live).
*   **Invalidasi Otomatis (Instant Invalidation)**: Cache secara otomatis dibersihkan seketika ketika ada penambahan, pengubahan, penghapusan laporan, atau keputusan verifikasi baru agar dashboard pimpinan tetap aktual.

### 3. 🔔 Notifikasi Real-time & Toast Alerts
*   **Siklus Polling 15 Detik**: Frontend SvelteKit melakukan sinkronisasi dengan endpoint `/api/notifikasi` setiap 15 detik menggunakan sesi cookie terenkripsi.
*   **Popup Premium**: Menggunakan Svelte 5 global stores untuk memicu notifikasi Toast dengan animasi mulus dan penyesuaian warna berdasarkan jenis aksi (Disetujui = Hijau, Ditolak = Merah, Revisi = Amber).

### 4. 🔒 Keamanan Siber & Input Sanitization
*   **Input Sanitizer**: Dilengkapi utilitas pembersih XSS (`sanitizer.ts`) yang memindai dan membersihkan tag HTML berbahaya dari payload request body secara rekursif sebelum disimpan di database.
*   **Security Headers**: Backend Elysia menginjeksi header keamanan standar industri secara global (termasuk Content Security Policy (CSP), HSTS, X-Frame-Options, X-Content-Type-Options, dan Referrer-Policy).
*   **Rate Limiting**: Pembatasan request berbasis IP klien (Login maks 5 req/menit, Buat laporan maks 15 req/menit, Upload berkas maks 20 req/menit) untuk mencegah serangan DoS dan brute force.

### 5. 🖼️ Kompresi Gambar Otomatis & Fail-Safe Upload
*   **Sharp Compression**: Setiap file dokumentasi berformat gambar akan dikompresi kualitasnya menjadi 80% dan ukurannya dibatasi pada resolusi maksimal 1200px lebar/tinggi guna menghemat penyimpanan server hingga 90%.
*   **Fail-Safe Mode**: Jika terjadi kendala pada library Sharp, sistem secara otomatis akan menggunakan fallback *raw upload* agar petugas di lapangan tetap dapat mengunggah berkas tanpa gangguan.

### 6. 🗑️ Mekanisme Soft Deletes (Aman untuk Audit)
*   **Penyimpanan Arsip**: Laporan yang dihapus oleh admin tidak akan hilang dari disk maupun database fisik melainkan hanya ditandai `deleted_at = waktu_penghapusan` untuk menjamin integritas data audit internal.

### 7. 🐳 Orkestrasi Docker & Automated Backup (DevOps)
*   **Full Dockerization**: Frontend, backend, dan database MySQL berjalan dalam kontainer terisolasi yang dihubungkan lewat network internal.
*   **Daily Backup Container**: Dilengkapi dengan container `db-backup` yang secara otomatis melakukan SQL dump database setiap pukul 02:00 pagi dan menyimpannya di drive lokal host (`c:/dp2kbp3a-backups`) selama 7 hari terakhir.

---

## 👥 Peran Pengguna & Hak Akses

| Peran | Deskripsi Hak Akses |
|-------|--------------------|
| `petugas` | Menginput laporan kegiatan, mengunggah dokumentasi, melihat laporan pribadi, dan merevisi data yang ditolak/diminta revisi. |
| `kepala_bidang` | Melihat seluruh laporan, memverifikasi (menyetujui/menolak/revisi) laporan khusus di bawah bidang kerjanya. |
| `pimpinan` | Memantau grafik statistik perkembangan kegiatan, mengunduh rekapitulasi, dan memantau log aktivitas. |
| `admin` | Mengelola data pengguna (petugas, kabid, pimpinan), mengelola master jenis kegiatan, serta memiliki akses penuh ke sistem. |

---

## 💻 Stack Teknologi

| Komponen | Teknologi |
|----------|-----------|
| **Frontend Framework** | SvelteKit 5 (Runes-based), Tailwind CSS v4 |
| **Backend Engine** | Elysia Framework, Bun Runtime |
| **Database & ORM** | MySQL 8, Drizzle ORM |
| **Image Processor** | Sharp |
| **Orkestrasi & Backup** | Docker Compose, databack/mysql-backup |

---

## ⚙️ Petunjuk Jalankan Aplikasi

### Opsi A. Menggunakan Docker Compose (Direkomendasikan untuk Produksi & Uji Coba)

Pastikan Anda telah menginstal **Docker Desktop** di komputer Anda.

1. Clone project ini dan masuk ke folder root.
2. Jalankan perintah orkestrasi Docker:
   ```bash
   docker compose up --build -d
   ```
3. Akses layanan:
   *   **Frontend**: [http://localhost:5173](http://localhost:5173)
   *   **Backend API**: [http://localhost:3000](http://localhost:3000)
   *   **MySQL Port**: `3306` (Tanpa password, db: `dp2kbp3a`)
4. Berkas dokumentasi akan tersimpan di `C:\dp2kbp3a-uploads` dan file backup harian berada di `C:\dp2kbp3a-backups` di komputer host Anda.

---

### Opsi B. Menjalankan Secara Manual (Development Mode)

#### Prasyarat:
*   [Bun Runtime](https://bun.sh/) terinstal di komputer.
*   Layanan database MySQL aktif.

#### Langkah 1: Inisialisasi Database
```sql
CREATE DATABASE dp2kbp3a CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
Import skema dasar:
```bash
mysql -u root -p dp2kbp3a < database/dp2kbp3a_schema.sql
```

#### Langkah 2: Konfigurasi & Jalankan Backend
1. Masuk ke folder backend:
   ```bash
   cd backend
   ```
2. Salin berkas lingkungan dan konfigurasikan koneksi MySQL:
   ```bash
   cp .env.example .env
   ```
3. Pasang dependensi dan jalankan database seeding:
   ```bash
   bun install
   bun run seed
   ```
4. Jalankan backend development server:
   ```bash
   bun run dev
   ```

#### Langkah 3: Konfigurasi & Jalankan Frontend
1. Kembali ke root folder, pasang dependensi:
   ```bash
   bun install
   ```
2. Salin berkas lingkungan frontend:
   ```bash
   cp .env.example .env
   ```
3. Jalankan frontend development server:
   ```bash
   bun run dev
   ```
Akses aplikasi di browser pada alamat: **http://localhost:5173**

---

## 🔑 Akun Default Seeding

Setelah menjalankan data seeding (`bun run seed`), Anda dapat masuk dengan akun Administrator berikut:

*   **Email**: `admin@dp2kbp3a.go.id`
*   **Password**: `Admin@1234`

> ⚠️ **PERINGATAN KEAMANAN**: Segera ubah kata sandi administrator Anda pada halaman pengaturan profil setelah berhasil masuk untuk pertama kalinya.

---

## 🏢 Daftar Bidang & Kegiatan Instansi

### 1. Bidang Pengendalian Penduduk (PP)
*   Penyuluhan Kependudukan, Pendataan Keluarga, Sosialisasi Program KKBPK, Pembinaan Kelompok Kerja, Pengumpulan Data Demografi, Analisis Pertumbuhan Penduduk.

### 2. Bidang Keluarga Berencana (KB)
*   Penyuluhan KB, Distribusi Alat Kontrasepsi, Pelayanan KB Keliling (Mobile), Konseling KB, Pendampingan Stunting, Kelompok KB Pria.

### 3. Bidang Pemberdayaan Perempuan (PRM)
*   Pelatihan Keterampilan Perempuan, Pengarusutamaan Gender, Pendampingan Korban KDRT, Pemberdayaan Ekonomi Perempuan, Sosialisasi Hak Perempuan.

### 4. Bidang Perlindungan Anak (PA)
*   Sosialisasi Perlindungan Anak, Forum Anak, Kota Layak Anak (KLA), Pelatihan Pola Asuh (Parenting), Pencegahan Kekerasan Anak.

---

Hak cipta © 2026 DP2KBP3A. Seluruh hak dilindungi.
