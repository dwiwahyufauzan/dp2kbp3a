-- ============================================================
-- DP2KBP3A — Migration Script
-- Gunakan jika database sudah ada sebelumnya dan perlu di-update
-- Jalankan: mysql -u root -p dp2kbp3a < database/migration_v2.sql
-- ============================================================

-- 1. Tambah kolom id_bidang ke jenis_kegiatan (jika belum ada)
ALTER TABLE `jenis_kegiatan`
  ADD COLUMN IF NOT EXISTS `id_bidang` VARCHAR(36) DEFAULT NULL AFTER `id_jenis`,
  ADD CONSTRAINT `fk_jk_bidang` FOREIGN KEY IF NOT EXISTS (`id_bidang`)
    REFERENCES `bidang` (`id_bidang`) ON DELETE SET NULL;

-- 2. Tambah kolom id_bidang ke laporan_kegiatan (jika belum ada)
--    Laporan menyimpan bidang yang dipilih petugas saat pembuatan
ALTER TABLE `laporan_kegiatan`
  ADD COLUMN IF NOT EXISTS `id_bidang` VARCHAR(36) DEFAULT NULL AFTER `id_user`,
  ADD CONSTRAINT `fk_lk_bidang` FOREIGN KEY IF NOT EXISTS (`id_bidang`)
    REFERENCES `bidang` (`id_bidang`) ON DELETE SET NULL;

-- 3. Tambah indeks untuk performa filter kepala_bidang
ALTER TABLE `laporan_kegiatan`
  ADD INDEX IF NOT EXISTS `idx_id_bidang_laporan` (`id_bidang`);

-- 2. Tambah kolom nama_asli ke dokumentasi_laporan (jika belum ada)
ALTER TABLE `dokumentasi_laporan`
  ADD COLUMN IF NOT EXISTS `nama_asli` VARCHAR(255) DEFAULT NULL AFTER `tipe_file`,
  MODIFY COLUMN `tipe_file` VARCHAR(100) DEFAULT NULL;

-- 3. Buat tabel riwayat_revisi jika belum ada
CREATE TABLE IF NOT EXISTS `riwayat_revisi` (
  `id_riwayat`       VARCHAR(36)  NOT NULL,
  `id_laporan`       VARCHAR(36)  NOT NULL,
  `id_user`          VARCHAR(36)  DEFAULT NULL,
  `tipe_aksi`        VARCHAR(50)  NOT NULL DEFAULT 'edit',
  `status_sebelum`   VARCHAR(50)  DEFAULT NULL,
  `status_sesudah`   VARCHAR(50)  DEFAULT NULL,
  `data_lama`        JSON         DEFAULT NULL,
  `catatan`          TEXT         DEFAULT NULL,
  `created_at`       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_riwayat`),
  KEY `idx_riwayat_laporan` (`id_laporan`),
  KEY `idx_riwayat_user`    (`id_user`),
  CONSTRAINT `fk_riwayat_laporan` FOREIGN KEY (`id_laporan`)
    REFERENCES `laporan_kegiatan` (`id_laporan`) ON DELETE CASCADE,
  CONSTRAINT `fk_riwayat_user` FOREIGN KEY (`id_user`)
    REFERENCES `users` (`id_user`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 4. Tambah kolom deleted_at untuk soft delete (jika belum ada)
ALTER TABLE `laporan_kegiatan`
  ADD COLUMN IF NOT EXISTS `deleted_at` TIMESTAMP NULL DEFAULT NULL AFTER `id_verifikator`,
  ADD INDEX IF NOT EXISTS `idx_deleted_at` (`deleted_at`);

-- 5. Update jenis_kegiatan yang sudah ada dengan id_bidang yang sesuai
-- (Jalankan ini hanya setelah bidang sudah di-seed!)
-- Contoh manual — sesuaikan dengan id_bidang di database Anda:
-- UPDATE jenis_kegiatan SET id_bidang = (SELECT id_bidang FROM bidang WHERE nama_bidang = 'Bidang Keluarga Berencana')
--   WHERE nama_kegiatan IN ('Penyuluhan KB', 'Distribusi Alat Kontrasepsi', 'Pendampingan Stunting');
-- UPDATE jenis_kegiatan SET id_bidang = (SELECT id_bidang FROM bidang WHERE nama_bidang = 'Bidang Pemberdayaan Perempuan')
--   WHERE nama_kegiatan IN ('Pemberdayaan Perempuan');
-- UPDATE jenis_kegiatan SET id_bidang = (SELECT id_bidang FROM bidang WHERE nama_bidang = 'Bidang Perlindungan Anak')
--   WHERE nama_kegiatan IN ('Perlindungan Anak');

-- NOTE: Setelah migration, jalankan `bun run seed` di folder /backend
-- untuk menambahkan kegiatan-kegiatan baru per bidang.
