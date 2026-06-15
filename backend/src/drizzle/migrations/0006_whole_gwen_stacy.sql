ALTER TABLE `laporan_kegiatan` ADD `deleted_at` timestamp NULL;--> statement-breakpoint
CREATE INDEX `idx_deleted_at` ON `laporan_kegiatan` (`deleted_at`);