CREATE TABLE `notifikasi` (
	`id_notif` varchar(36) NOT NULL,
	`id_user_penerima` varchar(36) NOT NULL,
	`judul` varchar(150) NOT NULL,
	`pesan` text NOT NULL,
	`tipe` varchar(50) NOT NULL,
	`id_referensi` varchar(36),
	`is_read` int NOT NULL DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `notifikasi_id_notif` PRIMARY KEY(`id_notif`)
);
--> statement-breakpoint
ALTER TABLE `laporan_kegiatan` ADD `jumlah_laki` int;--> statement-breakpoint
ALTER TABLE `laporan_kegiatan` ADD `jumlah_perempuan` int;--> statement-breakpoint
ALTER TABLE `notifikasi` ADD CONSTRAINT `notifikasi_id_user_penerima_users_id_user_fk` FOREIGN KEY (`id_user_penerima`) REFERENCES `users`(`id_user`) ON DELETE cascade ON UPDATE no action;