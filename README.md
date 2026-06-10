# DP2KBP3A — Sistem Pelaporan Kegiatan Lapangan

Sistem informasi manajemen pelaporan kegiatan lapangan untuk **Dinas Pengendalian Penduduk, Keluarga Berencana, Pemberdayaan Perempuan dan Perlindungan Anak (DP2KBP3A)**.

## Tentang Aplikasi

Aplikasi ini dirancang untuk memudahkan petugas lapangan dalam melaporkan kegiatan harian, serta mempermudah kepala bidang dan pimpinan dalam memantau, memverifikasi, dan merekap seluruh aktivitas operasional di lapangan.

## Tampilan Aplikasi (Preview)

Berikut adalah contoh pratinjau antarmuka dari sistem DP2KBP3A (ganti gambar di folder `screenshots/` sesuai keinginan Anda):

| Halaman Dashboard | Halaman Buat Laporan |
|:---:|:---:|
| ![Dashboard](screenshots/dashboard.png) | ![Buat Laporan](screenshots/buat_laporan.png) |

| Halaman Detail Laporan & Revisi | Halaman Statistik Kegiatan |
|:---:|:---:|
| ![Detail Laporan](screenshots/detail_laporan.png) | ![Statistik](screenshots/statistik.png) |

### Fitur Utama

- 📝 **Input Laporan** — Petugas dapat menginput laporan kegiatan dengan detail lokasi, jenis kegiatan per bidang, jumlah peserta, dan deskripsi hasil kegiatan
- 📎 **Upload Dokumentasi** — Mendukung upload gambar (JPG, PNG, WebP), PDF, Word (.docx), Excel (.xlsx), dan ZIP
- ✅ **Verifikasi Laporan** — Kepala bidang dapat menyetujui, menolak, atau meminta revisi laporan
- 🔄 **Riwayat Revisi** — Setiap perubahan laporan tersimpan sebagai histori yang dapat dilihat kapan saja
- 📊 **Rekap & Statistik** — Rekapitulasi dan statistik kegiatan per bidang, per periode, dan per wilayah
- 🔔 **Notifikasi** — Notifikasi real-time untuk laporan baru, persetujuan, penolakan, dan permintaan revisi
- 👥 **Manajemen Pengguna** — Admin dapat mengelola akun petugas, kepala bidang, dan pimpinan
- 🏢 **Kegiatan per Bidang** — Setiap bidang memiliki daftar kegiatan tersendiri yang muncul secara dinamis

### Peran Pengguna

| Peran | Hak Akses |
|-------|-----------|
| `petugas` | Input laporan, upload dokumentasi, lihat laporan sendiri |
| `kepala_bidang` | Verifikasi laporan bidangnya, lihat semua laporan |
| `pimpinan` | Lihat statistik & rekap, kelola master kegiatan |
| `admin` | Akses penuh — kelola pengguna, semua laporan, dan konfigurasi |

---

## Stack Teknologi

| Komponen | Teknologi |
|----------|-----------|
| Frontend | SvelteKit 5, Tailwind CSS v4 |
| Backend | Elysia (Bun runtime) |
| ORM | Drizzle ORM |
| Database | MySQL 8+ |
| Auth | JWT (cookie-based session) |
| Runtime | Bun |

---

## Struktur Folder

```
DP2KBP3A/
├── backend/               # API Server (Elysia + Bun)
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.ts  # Drizzle schema (semua tabel)
│   │   │   └── connection.ts
│   │   ├── routes/        # Route handler per fitur
│   │   ├── plugins/       # JWT auth plugin
│   │   ├── seed.ts        # Data awal database
│   │   └── index.ts       # Entry point API
│   └── uploads/           # File upload tersimpan di sini
│
├── src/                   # Frontend SvelteKit
│   ├── lib/
│   │   ├── components/    # Komponen reusable (Sidebar, dll)
│   │   ├── server/        # API helper (server-side)
│   │   └── stores/        # State management (Svelte stores)
│   └── routes/
│       ├── (app)/         # Halaman utama (protected)
│       │   ├── dashboard/
│       │   ├── laporan/   # CRUD laporan kegiatan
│       │   ├── verifikasi/
│       │   ├── rekap/
│       │   ├── statistik/
│       │   └── admin/
│       ├── login/
│       └── api/           # Server routes (proxy/upload)
│
└── database/
    └── dp2kbp3a_schema.sql  # SQL lengkap untuk setup database
```

---

## Cara Instalasi & Menjalankan

### Prasyarat

- [Bun](https://bun.sh/) v1.x
- MySQL 8+
- Node.js 18+ (untuk frontend)

### 1. Setup Database

```sql
-- Buat database di MySQL
CREATE DATABASE dp2kbp3a CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Kemudian import file SQL:
```sh
mysql -u root -p dp2kbp3a < database/dp2kbp3a_schema.sql
```

### 2. Setup Backend

```sh
cd backend

# Salin dan isi variabel lingkungan
cp .env.example .env
# Edit .env: isi DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET

# Install dependensi
bun install

# Jalankan seed data awal (roles, bidang, kegiatan, admin)
bun run seed

# Jalankan server backend (port 3000)
bun run dev
```

### 3. Setup Frontend

```sh
# Di folder root project
npm install  # atau: bun install

# Salin dan isi .env
cp .env.example .env
# Edit: VITE_API_URL=http://localhost:3000

# Jalankan development server (port 5173)
npm run dev
```

Akses aplikasi di: **http://localhost:5173**

---

## Akun Default (Setelah Seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@dp2kbp3a.go.id` | `Admin@1234` |

> ⚠️ **PENTING**: Segera ganti password admin setelah login pertama kali!

---

## Bidang & Kegiatan

### Bidang Pengendalian Penduduk
- Penyuluhan Kependudukan
- Pendataan Keluarga
- Sosialisasi Program KKBPK
- Pembinaan Kelompok Kerja
- Pengumpulan Data Demografi
- Analisis Laju Pertumbuhan Penduduk

### Bidang Keluarga Berencana
- Penyuluhan KB
- Distribusi Alat Kontrasepsi
- Pelayanan KB Mobile
- Pendampingan Akseptor KB Baru
- Konseling KB
- Monitoring Peserta KB Aktif
- Pembentukan Kelompok KB Pria

### Bidang Pemberdayaan Perempuan
- Pelatihan Keterampilan Perempuan
- Sosialisasi Pengarusutamaan Gender
- Pembinaan Organisasi Wanita
- Pendampingan Korban KDRT
- Peningkatan Kapasitas Perempuan
- Penyuluhan Hak-Hak Perempuan

### Bidang Perlindungan Anak
- Sosialisasi Perlindungan Anak
- Penanganan Kasus Anak
- Pembentukan Forum Anak
- Pengembangan Kota Layak Anak
- Pendampingan Anak Rentan
- Pelatihan Parenting
- Monitoring Tumbuh Kembang Anak

---

## Lisensi

Hak cipta © 2025 DP2KBP3A. Seluruh hak dilindungi.
