CREATE TABLE `master_kegiatan` (
	`id` varchar(36) NOT NULL,
	`nama` varchar(100) NOT NULL,
	`kode` varchar(30) NOT NULL,
	`deskripsi` text,
	`aktif` enum('y','n') NOT NULL DEFAULT 'y',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `master_kegiatan_id` PRIMARY KEY(`id`),
	CONSTRAINT `master_kegiatan_kode_unique` UNIQUE(`kode`)
);
--> statement-breakpoint
ALTER TABLE `laporan` DROP INDEX `unik_laporan`;--> statement-breakpoint
ALTER TABLE `laporan` ADD `jenis_kegiatan_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `laporan` ADD CONSTRAINT `unik_laporan` UNIQUE(`petugas_id`,`tanggal`,`lokasi`,`jenis_kegiatan_id`);--> statement-breakpoint
ALTER TABLE `laporan` ADD CONSTRAINT `laporan_jenis_kegiatan_id_master_kegiatan_id_fk` FOREIGN KEY (`jenis_kegiatan_id`) REFERENCES `master_kegiatan`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `laporan` DROP COLUMN `jenis_kegiatan`;