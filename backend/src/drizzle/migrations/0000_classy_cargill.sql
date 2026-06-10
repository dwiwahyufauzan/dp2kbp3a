CREATE TABLE `laporan` (
	`id` varchar(36) NOT NULL,
	`petugas_id` varchar(36) NOT NULL,
	`tanggal` date NOT NULL,
	`lokasi` varchar(200) NOT NULL,
	`jenis_kegiatan` enum('penyuluhan_kb','pendataan_keluarga','distribusi_alkon','pemberdayaan_perempuan','perlindungan_anak','lainnya') NOT NULL,
	`jumlah_peserta` int NOT NULL,
	`deskripsi` text,
	`dokumentasi_url` varchar(500),
	`status` enum('menunggu','disetujui','ditolak','revisi') NOT NULL DEFAULT 'menunggu',
	`catatan_verifikasi` text,
	`verifikator_id` varchar(36),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `laporan_id` PRIMARY KEY(`id`),
	CONSTRAINT `unik_laporan` UNIQUE(`petugas_id`,`tanggal`,`lokasi`,`jenis_kegiatan`)
);
--> statement-breakpoint
CREATE TABLE `pengguna` (
	`id` varchar(36) NOT NULL,
	`nama` varchar(100) NOT NULL,
	`email` varchar(150) NOT NULL,
	`password_hash` text NOT NULL,
	`role` enum('petugas','kepala_bidang','admin','pimpinan') NOT NULL,
	`unit_kerja_id` varchar(36),
	`aktif` enum('y','n') NOT NULL DEFAULT 'y',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pengguna_id` PRIMARY KEY(`id`),
	CONSTRAINT `pengguna_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `unit_kerja` (
	`id` varchar(36) NOT NULL,
	`nama` varchar(100) NOT NULL,
	`kode` varchar(20) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `unit_kerja_id` PRIMARY KEY(`id`),
	CONSTRAINT `unit_kerja_kode_unique` UNIQUE(`kode`)
);
--> statement-breakpoint
ALTER TABLE `laporan` ADD CONSTRAINT `laporan_petugas_id_pengguna_id_fk` FOREIGN KEY (`petugas_id`) REFERENCES `pengguna`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `laporan` ADD CONSTRAINT `laporan_verifikator_id_pengguna_id_fk` FOREIGN KEY (`verifikator_id`) REFERENCES `pengguna`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pengguna` ADD CONSTRAINT `pengguna_unit_kerja_id_unit_kerja_id_fk` FOREIGN KEY (`unit_kerja_id`) REFERENCES `unit_kerja`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_status` ON `laporan` (`status`);--> statement-breakpoint
CREATE INDEX `idx_tanggal` ON `laporan` (`tanggal`);--> statement-breakpoint
CREATE INDEX `idx_petugas` ON `laporan` (`petugas_id`);