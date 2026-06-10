CREATE TABLE `bidang` (
	`id_bidang` varchar(36) NOT NULL,
	`nama_bidang` varchar(100) NOT NULL,
	`deskripsi` text,
	CONSTRAINT `bidang_id_bidang` PRIMARY KEY(`id_bidang`)
);
--> statement-breakpoint
CREATE TABLE `dokumentasi_laporan` (
	`id_dokumentasi` varchar(36) NOT NULL,
	`id_laporan` varchar(36) NOT NULL,
	`file_path` text NOT NULL,
	`tipe_file` varchar(10),
	CONSTRAINT `dokumentasi_laporan_id_dokumentasi` PRIMARY KEY(`id_dokumentasi`)
);
--> statement-breakpoint
CREATE TABLE `jenis_kegiatan` (
	`id_jenis` varchar(36) NOT NULL,
	`nama_kegiatan` varchar(100) NOT NULL,
	CONSTRAINT `jenis_kegiatan_id_jenis` PRIMARY KEY(`id_jenis`)
);
--> statement-breakpoint
CREATE TABLE `laporan_kegiatan` (
	`id_laporan` varchar(36) NOT NULL,
	`id_user` varchar(36) NOT NULL,
	`id_jenis` varchar(36) NOT NULL,
	`tanggal_kegiatan` date NOT NULL,
	`lokasi_detail` text NOT NULL,
	`jumlah_peserta` int NOT NULL,
	`deskripsi_kegiatan` text,
	`status_verifikasi` enum('Pending','Disetujui','Ditolak','Revisi') NOT NULL DEFAULT 'Pending',
	`catatan_verifikator` text,
	`id_verifikator` varchar(36),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `laporan_kegiatan_id_laporan` PRIMARY KEY(`id_laporan`)
);
--> statement-breakpoint
CREATE TABLE `log_aktivitas` (
	`id_log` varchar(36) NOT NULL,
	`id_user` varchar(36),
	`aksi` varchar(100) NOT NULL,
	`keterangan` text,
	`ip_address` varchar(45),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `log_aktivitas_id_log` PRIMARY KEY(`id_log`)
);
--> statement-breakpoint
CREATE TABLE `lokasi_tugas` (
	`id_lokasi` varchar(36) NOT NULL,
	`nama_kecamatan` varchar(100) NOT NULL,
	`nama_desa_kelurahan` varchar(100) NOT NULL,
	CONSTRAINT `lokasi_tugas_id_lokasi` PRIMARY KEY(`id_lokasi`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id_role` varchar(36) NOT NULL,
	`nama_role` varchar(50) NOT NULL,
	CONSTRAINT `roles_id_role` PRIMARY KEY(`id_role`),
	CONSTRAINT `roles_nama_role_unique` UNIQUE(`nama_role`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id_user` varchar(36) NOT NULL,
	`id_role` varchar(36) NOT NULL,
	`id_bidang` varchar(36),
	`id_lokasi` varchar(36),
	`nama_lengkap` varchar(100) NOT NULL,
	`email` varchar(150) NOT NULL,
	`password` text NOT NULL,
	`status_aktif` enum('y','n') NOT NULL DEFAULT 'y',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id_user` PRIMARY KEY(`id_user`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
DROP TABLE `laporan`;--> statement-breakpoint
DROP TABLE `master_kegiatan`;--> statement-breakpoint
DROP TABLE `pengguna`;--> statement-breakpoint
DROP TABLE `unit_kerja`;--> statement-breakpoint
ALTER TABLE `dokumentasi_laporan` ADD CONSTRAINT `dokumentasi_laporan_id_laporan_laporan_kegiatan_id_laporan_fk` FOREIGN KEY (`id_laporan`) REFERENCES `laporan_kegiatan`(`id_laporan`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `laporan_kegiatan` ADD CONSTRAINT `laporan_kegiatan_id_user_users_id_user_fk` FOREIGN KEY (`id_user`) REFERENCES `users`(`id_user`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `laporan_kegiatan` ADD CONSTRAINT `laporan_kegiatan_id_jenis_jenis_kegiatan_id_jenis_fk` FOREIGN KEY (`id_jenis`) REFERENCES `jenis_kegiatan`(`id_jenis`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `laporan_kegiatan` ADD CONSTRAINT `laporan_kegiatan_id_verifikator_users_id_user_fk` FOREIGN KEY (`id_verifikator`) REFERENCES `users`(`id_user`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `log_aktivitas` ADD CONSTRAINT `log_aktivitas_id_user_users_id_user_fk` FOREIGN KEY (`id_user`) REFERENCES `users`(`id_user`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_id_role_roles_id_role_fk` FOREIGN KEY (`id_role`) REFERENCES `roles`(`id_role`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_id_bidang_bidang_id_bidang_fk` FOREIGN KEY (`id_bidang`) REFERENCES `bidang`(`id_bidang`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_id_lokasi_lokasi_tugas_id_lokasi_fk` FOREIGN KEY (`id_lokasi`) REFERENCES `lokasi_tugas`(`id_lokasi`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_id_user` ON `laporan_kegiatan` (`id_user`);--> statement-breakpoint
CREATE INDEX `idx_tanggal` ON `laporan_kegiatan` (`tanggal_kegiatan`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `laporan_kegiatan` (`status_verifikasi`);