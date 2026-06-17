-- ============================================================
-- DP2KBP3A — Database Schema & Seed Data
-- Sistem Pelaporan Kegiatan Lapangan
-- Dinas Pengendalian Penduduk, KB, Pemberdayaan Perempuan
-- dan Perlindungan Anak
--
-- Cara pakai:
--   mysql -u root -p dp2kbp3a < database/dp2kbp3a_schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS `dp2kbp3a`;
USE `dp2kbp3a`;

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

-- ──────────────────────────────────────────────────────────────
-- 1. ROLES
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `roles` (
  `id_role`   VARCHAR(36)  NOT NULL,
  `nama_role` VARCHAR(50)  NOT NULL,
  PRIMARY KEY (`id_role`),
  UNIQUE KEY `uq_nama_role` (`nama_role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────────
-- 2. BIDANG
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `bidang` (
  `id_bidang`   VARCHAR(36)  NOT NULL,
  `nama_bidang` VARCHAR(100) NOT NULL,
  `deskripsi`   TEXT,
  PRIMARY KEY (`id_bidang`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────────
-- 3. JENIS KEGIATAN (terhubung ke bidang)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `jenis_kegiatan` (
  `id_jenis`      VARCHAR(36)  NOT NULL,
  `id_bidang`     VARCHAR(36)  DEFAULT NULL,
  `nama_kegiatan` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id_jenis`),
  KEY `idx_id_bidang` (`id_bidang`),
  CONSTRAINT `fk_jk_bidang` FOREIGN KEY (`id_bidang`)
    REFERENCES `bidang` (`id_bidang`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────────
-- 4. LOKASI TUGAS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `lokasi_tugas` (
  `id_lokasi`           VARCHAR(36)  NOT NULL,
  `nama_kecamatan`      VARCHAR(100) NOT NULL,
  `nama_desa_kelurahan` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id_lokasi`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────────
-- 5. USERS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `users` (
  `id_user`     VARCHAR(36)  NOT NULL,
  `id_role`     VARCHAR(36)  NOT NULL,
  `id_bidang`   VARCHAR(36)  DEFAULT NULL,
  `id_lokasi`   VARCHAR(36)  DEFAULT NULL,
  `nama_lengkap` VARCHAR(100) NOT NULL,
  `email`       VARCHAR(150) NOT NULL,
  `password`    TEXT         NOT NULL,
  `status_aktif` ENUM('y','n') NOT NULL DEFAULT 'y',
  `created_at`  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_user`),
  UNIQUE KEY `uq_email` (`email`),
  KEY `idx_id_role` (`id_role`),
  KEY `idx_id_bidang` (`id_bidang`),
  KEY `idx_id_lokasi` (`id_lokasi`),
  CONSTRAINT `fk_users_role`   FOREIGN KEY (`id_role`)   REFERENCES `roles` (`id_role`)   ON DELETE RESTRICT,
  CONSTRAINT `fk_users_bidang` FOREIGN KEY (`id_bidang`) REFERENCES `bidang` (`id_bidang`) ON DELETE SET NULL,
  CONSTRAINT `fk_users_lokasi` FOREIGN KEY (`id_lokasi`) REFERENCES `lokasi_tugas` (`id_lokasi`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────────
-- 6. LAPORAN KEGIATAN
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `laporan_kegiatan` (
  `id_laporan`          VARCHAR(36)  NOT NULL,
  `id_user`             VARCHAR(36)  NOT NULL,
  `id_bidang`           VARCHAR(36)  DEFAULT NULL,
  `id_jenis`            VARCHAR(36)  NOT NULL,
  `tanggal_kegiatan`    DATE         NOT NULL,
  `lokasi_detail`       TEXT         NOT NULL,
  `jumlah_peserta`      INT          NOT NULL,
  `jumlah_laki`         INT          DEFAULT NULL,
  `jumlah_perempuan`    INT          DEFAULT NULL,
  `deskripsi_kegiatan`  TEXT,
  `status_verifikasi`   ENUM('Pending','Disetujui','Ditolak','Revisi') NOT NULL DEFAULT 'Pending',
  `catatan_verifikator` TEXT,
  `id_verifikator`      VARCHAR(36)  DEFAULT NULL,
  `deleted_at`          TIMESTAMP    NULL DEFAULT NULL,
  `created_at`          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  `updated_at`          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_laporan`),
  KEY `idx_id_user`   (`id_user`),
  KEY `idx_id_bidang_laporan` (`id_bidang`),
  KEY `idx_tanggal`   (`tanggal_kegiatan`),
  KEY `idx_status`    (`status_verifikasi`),
  KEY `idx_id_jenis`  (`id_jenis`),
  KEY `idx_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_lk_user`  FOREIGN KEY (`id_user`)  REFERENCES `users` (`id_user`) ON DELETE RESTRICT,
  CONSTRAINT `fk_lk_bidang` FOREIGN KEY (`id_bidang`) REFERENCES `bidang` (`id_bidang`) ON DELETE SET NULL,
  CONSTRAINT `fk_lk_jenis` FOREIGN KEY (`id_jenis`) REFERENCES `jenis_kegiatan` (`id_jenis`) ON DELETE RESTRICT,
  CONSTRAINT `fk_lk_verif` FOREIGN KEY (`id_verifikator`) REFERENCES `users` (`id_user`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────────
-- 7. DOKUMENTASI LAPORAN
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `dokumentasi_laporan` (
  `id_dokumentasi` VARCHAR(36)  NOT NULL,
  `id_laporan`     VARCHAR(36)  NOT NULL,
  `file_path`      TEXT         NOT NULL,
  `tipe_file`      VARCHAR(100) DEFAULT NULL,
  `nama_asli`      VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id_dokumentasi`),
  KEY `idx_dok_laporan` (`id_laporan`),
  CONSTRAINT `fk_dok_laporan` FOREIGN KEY (`id_laporan`)
    REFERENCES `laporan_kegiatan` (`id_laporan`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────────
-- 8. RIWAYAT REVISI LAPORAN (BARU)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `riwayat_revisi` (
  `id_riwayat`       VARCHAR(36)  NOT NULL,
  `id_laporan`       VARCHAR(36)  NOT NULL,
  `id_user`          VARCHAR(36)  DEFAULT NULL,
  `tipe_aksi`        VARCHAR(50)  NOT NULL DEFAULT 'edit',
  -- 'edit' = petugas edit, 'verifikasi' = kepala bidang verifikasi
  `status_sebelum`   VARCHAR(50)  DEFAULT NULL,
  `status_sesudah`   VARCHAR(50)  DEFAULT NULL,
  `data_lama`        JSON         DEFAULT NULL,
  -- snapshot data laporan sebelum diubah
  `catatan`          TEXT         DEFAULT NULL,
  `created_at`       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_riwayat`),
  KEY `idx_riwayat_laporan` (`id_laporan`),
  KEY `idx_riwayat_user`    (`id_user`),
  CONSTRAINT `fk_riwayat_laporan` FOREIGN KEY (`id_laporan`)
    REFERENCES `laporan_kegiatan` (`id_laporan`) ON DELETE CASCADE,
  CONSTRAINT `fk_riwayat_user` FOREIGN KEY (`id_user`)
    REFERENCES `users` (`id_user`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────────
-- 9. NOTIFIKASI
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `notifikasi` (
  `id_notif`         VARCHAR(36)  NOT NULL,
  `id_user_penerima` VARCHAR(36)  NOT NULL,
  `judul`            VARCHAR(150) NOT NULL,
  `pesan`            TEXT         NOT NULL,
  `tipe`             VARCHAR(50)  NOT NULL,
  `id_referensi`     VARCHAR(36)  DEFAULT NULL,
  `is_read`          INT          NOT NULL DEFAULT 0,
  `created_at`       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_notif`),
  KEY `idx_notif_user` (`id_user_penerima`),
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`id_user_penerima`)
    REFERENCES `users` (`id_user`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────────
-- 10. LOG AKTIVITAS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `log_aktivitas` (
  `id_log`     VARCHAR(36)  NOT NULL,
  `id_user`    VARCHAR(36)  DEFAULT NULL,
  `aksi`       VARCHAR(100) NOT NULL,
  `keterangan` TEXT,
  `ip_address` VARCHAR(45)  DEFAULT NULL,
  `created_at` TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_log`),
  KEY `idx_log_user` (`id_user`),
  CONSTRAINT `fk_log_user` FOREIGN KEY (`id_user`)
    REFERENCES `users` (`id_user`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- SEED DATA
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- ROLES
-- ──────────────────────────────────────────────────────────────
INSERT IGNORE INTO `roles` (`id_role`, `nama_role`) VALUES
  ('role-admin-001',  'admin'),
  ('role-ptgs-001',   'petugas'),
  ('role-kabid-001',  'kepala_bidang'),
  ('role-pimp-001',   'pimpinan');

-- ──────────────────────────────────────────────────────────────
-- BIDANG
-- ──────────────────────────────────────────────────────────────
INSERT IGNORE INTO `bidang` (`id_bidang`, `nama_bidang`, `deskripsi`) VALUES
  ('bid-pp-001',  'Bidang Pengendalian Penduduk',  'Menangani program pengendalian pertumbuhan penduduk'),
  ('bid-kb-001',  'Bidang Keluarga Berencana',     'Menangani program Keluarga Berencana dan kontrasepsi'),
  ('bid-prm-001', 'Bidang Pemberdayaan Perempuan', 'Menangani program pemberdayaan dan perlindungan perempuan'),
  ('bid-pa-001',  'Bidang Perlindungan Anak',      'Menangani program perlindungan dan pengembangan anak');

-- ──────────────────────────────────────────────────────────────
-- JENIS KEGIATAN PER BIDANG
-- ──────────────────────────────────────────────────────────────

-- Bidang Pengendalian Penduduk
INSERT IGNORE INTO `jenis_kegiatan` (`id_jenis`, `id_bidang`, `nama_kegiatan`) VALUES
  ('jk-pp-001', 'bid-pp-001', 'Penyuluhan Kependudukan'),
  ('jk-pp-002', 'bid-pp-001', 'Pendataan Keluarga'),
  ('jk-pp-003', 'bid-pp-001', 'Sosialisasi Program KKBPK'),
  ('jk-pp-004', 'bid-pp-001', 'Pembinaan Kelompok Kerja'),
  ('jk-pp-005', 'bid-pp-001', 'Pengumpulan Data Demografi'),
  ('jk-pp-006', 'bid-pp-001', 'Analisis Laju Pertumbuhan Penduduk'),
  ('jk-pp-007', 'bid-pp-001', 'Koordinasi Lintas Sektor Kependudukan');

-- Bidang Keluarga Berencana
INSERT IGNORE INTO `jenis_kegiatan` (`id_jenis`, `id_bidang`, `nama_kegiatan`) VALUES
  ('jk-kb-001', 'bid-kb-001', 'Penyuluhan KB'),
  ('jk-kb-002', 'bid-kb-001', 'Distribusi Alat Kontrasepsi'),
  ('jk-kb-003', 'bid-kb-001', 'Pelayanan KB Mobile'),
  ('jk-kb-004', 'bid-kb-001', 'Pendampingan Akseptor KB Baru'),
  ('jk-kb-005', 'bid-kb-001', 'Konseling KB'),
  ('jk-kb-006', 'bid-kb-001', 'Monitoring Peserta KB Aktif'),
  ('jk-kb-007', 'bid-kb-001', 'Pembentukan Kelompok KB Pria'),
  ('jk-kb-008', 'bid-kb-001', 'Pendampingan Stunting');

-- Bidang Pemberdayaan Perempuan
INSERT IGNORE INTO `jenis_kegiatan` (`id_jenis`, `id_bidang`, `nama_kegiatan`) VALUES
  ('jk-prm-001', 'bid-prm-001', 'Pelatihan Keterampilan Perempuan'),
  ('jk-prm-002', 'bid-prm-001', 'Sosialisasi Pengarusutamaan Gender'),
  ('jk-prm-003', 'bid-prm-001', 'Pembinaan Organisasi Wanita'),
  ('jk-prm-004', 'bid-prm-001', 'Pendampingan Korban KDRT'),
  ('jk-prm-005', 'bid-prm-001', 'Peningkatan Kapasitas Perempuan'),
  ('jk-prm-006', 'bid-prm-001', 'Penyuluhan Hak-Hak Perempuan'),
  ('jk-prm-007', 'bid-prm-001', 'Pemberdayaan Ekonomi Perempuan');

-- Bidang Perlindungan Anak
INSERT IGNORE INTO `jenis_kegiatan` (`id_jenis`, `id_bidang`, `nama_kegiatan`) VALUES
  ('jk-pa-001', 'bid-pa-001', 'Sosialisasi Perlindungan Anak'),
  ('jk-pa-002', 'bid-pa-001', 'Penanganan Kasus Anak'),
  ('jk-pa-003', 'bid-pa-001', 'Pembentukan Forum Anak'),
  ('jk-pa-004', 'bid-pa-001', 'Pengembangan Kota Layak Anak'),
  ('jk-pa-005', 'bid-pa-001', 'Pendampingan Anak Rentan'),
  ('jk-pa-006', 'bid-pa-001', 'Pelatihan Parenting'),
  ('jk-pa-007', 'bid-pa-001', 'Monitoring Tumbuh Kembang Anak'),
  ('jk-pa-008', 'bid-pa-001', 'Pencegahan Kekerasan pada Anak');

-- ──────────────────────────────────────────────────────────────
-- ADMIN DEFAULT
-- Password: Admin@1234 (bcrypt hash — ganti via aplikasi setelah login)
-- Catatan: password di bawah hanya placeholder, jalankan `bun run seed`
-- untuk membuat admin dengan password yang di-hash dengan benar.
-- ──────────────────────────────────────────────────────────────
-- INSERT IGNORE INTO `users`
--   (`id_user`, `id_role`, `nama_lengkap`, `email`, `password`, `status_aktif`)
-- VALUES
--   (UUID(), 'role-admin-001', 'Administrator', 'admin@dp2kbp3a.go.id',
--    '$2b$10$placeholder_hash_run_seed_instead', 'y');
-- CATATAN: Jalankan `bun run seed` di folder /backend untuk membuat akun admin
-- dengan password yang di-hash secara benar menggunakan bcrypt.
