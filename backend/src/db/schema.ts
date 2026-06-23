import {
  mysqlTable,
  varchar,
  text,
  int,
  timestamp,
  mysqlEnum,
  date,
  index,
  json,
} from 'drizzle-orm/mysql-core'
import { relations } from 'drizzle-orm'

// ─── Roles ─────────────────────────────────────────────────────────────────
// SRS: Tabel roles — menyimpan hak akses / peran pengguna
export const roles = mysqlTable('roles', {
  idRole: varchar('id_role', { length: 36 }).primaryKey(),
  namaRole: varchar('nama_role', { length: 50 }).notNull().unique(),
  permissions: json('permissions').$type<string[]>(),
})

// ─── Bidang ────────────────────────────────────────────────────────────────
// SRS F-11: Struktur bidang/unit kerja
export const bidang = mysqlTable('bidang', {
  idBidang: varchar('id_bidang', { length: 36 }).primaryKey(),
  namaBidang: varchar('nama_bidang', { length: 100 }).notNull(),
  deskripsi: text('deskripsi'),
})

// ─── Jenis Kegiatan ────────────────────────────────────────────────────────
// SRS: Master jenis kegiatan per bidang
// idBidang = NULL berarti kegiatan lintas bidang / umum
export const jenisKegiatan = mysqlTable('jenis_kegiatan', {
  idJenis: varchar('id_jenis', { length: 36 }).primaryKey(),
  idBidang: varchar('id_bidang', { length: 36 }).references(
    () => bidang.idBidang,
    { onDelete: 'set null' }
  ),
  namaKegiatan: varchar('nama_kegiatan', { length: 100 }).notNull(),
})

// ─── Lokasi Tugas ──────────────────────────────────────────────────────────
// SRS: Master data wilayah tugas operasional
export const lokasiTugas = mysqlTable('lokasi_tugas', {
  idLokasi: varchar('id_lokasi', { length: 36 }).primaryKey(),
  namaKecamatan: varchar('nama_kecamatan', { length: 100 }).notNull(),
  namaDesa: varchar('nama_desa_kelurahan', { length: 100 }).notNull(),
})

// ─── Users ─────────────────────────────────────────────────────────────────
// SRS F-01, F-06, F-10: Autentikasi dan data profil pengguna
export const users = mysqlTable('users', {
  idUser: varchar('id_user', { length: 36 }).primaryKey(),
  idRole: varchar('id_role', { length: 36 })
    .notNull()
    .references(() => roles.idRole, { onDelete: 'restrict' }),
  idBidang: varchar('id_bidang', { length: 36 }).references(
    () => bidang.idBidang,
    { onDelete: 'set null' }
  ),
  idLokasi: varchar('id_lokasi', { length: 36 }).references(
    () => lokasiTugas.idLokasi,
    { onDelete: 'set null' }
  ),
  namaLengkap: varchar('nama_lengkap', { length: 100 }).notNull(),
  email: varchar('email', { length: 150 }).notNull().unique(),
  password: text('password').notNull(), // tersimpan dalam bentuk hash (bcrypt)
  statusAktif: mysqlEnum('status_aktif', ['y', 'n']).notNull().default('y'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
})

// ─── Laporan Kegiatan ──────────────────────────────────────────────────────
// SRS F-02, F-03, F-04, F-08: Tabel inti pelaporan kegiatan
export const laporanKegiatan = mysqlTable(
  'laporan_kegiatan',
  {
    idLaporan: varchar('id_laporan', { length: 36 }).primaryKey(),
    idUser: varchar('id_user', { length: 36 })
      .notNull()
      .references(() => users.idUser, { onDelete: 'restrict' }),
    idBidang: varchar('id_bidang', { length: 36 }).references(
      () => bidang.idBidang,
      { onDelete: 'set null' }
    ),
    idJenis: varchar('id_jenis', { length: 36 })
      .notNull()
      .references(() => jenisKegiatan.idJenis, { onDelete: 'restrict' }),
    tanggalKegiatan: date('tanggal_kegiatan').notNull(),
    lokasiDetail: text('lokasi_detail').notNull(),
    jumlahPeserta: int('jumlah_peserta').notNull(),
    jumlahLaki: int('jumlah_laki'),
    jumlahPerempuan: int('jumlah_perempuan'),
    deskripsiKegiatan: text('deskripsi_kegiatan'),
    statusVerifikasi: mysqlEnum('status_verifikasi', [
      'Pending',
      'Disetujui',
      'Ditolak',
      'Revisi',
    ])
      .notNull()
      .default('Pending'),
    catatanVerifikator: text('catatan_verifikator'),
    idVerifikator: varchar('id_verifikator', { length: 36 }).references(
      () => users.idUser,
      { onDelete: 'set null' }
    ),
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
  },
  (table) => ({
    idxIdUser: index('idx_id_user').on(table.idUser),
    idxIdBidang: index('idx_id_bidang_laporan').on(table.idBidang),
    idxTanggal: index('idx_tanggal').on(table.tanggalKegiatan),
    idxStatus: index('idx_status').on(table.statusVerifikasi),
    idxDeletedAt: index('idx_deleted_at').on(table.deletedAt),
  })
)

// ─── Dokumentasi Laporan ───────────────────────────────────────────────────
// SRS: 1 laporan dapat memiliki banyak foto/dokumen
export const dokumentasiLaporan = mysqlTable('dokumentasi_laporan', {
  idDokumentasi: varchar('id_dokumentasi', { length: 36 }).primaryKey(),
  idLaporan: varchar('id_laporan', { length: 36 })
    .notNull()
    .references(() => laporanKegiatan.idLaporan, { onDelete: 'cascade' }),
  filePath: text('file_path').notNull(),
  tipeFile: varchar('tipe_file', { length: 100 }),
  namaAsli: varchar('nama_asli', { length: 255 }),
})

// ─── Riwayat Revisi ────────────────────────────────────────────────────────
// Histori setiap perubahan/verifikasi laporan
export const riwayatRevisi = mysqlTable('riwayat_revisi', {
  idRiwayat: varchar('id_riwayat', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  idLaporan: varchar('id_laporan', { length: 36 })
    .notNull()
    .references(() => laporanKegiatan.idLaporan, { onDelete: 'cascade' }),
  idUser: varchar('id_user', { length: 36 }).references(() => users.idUser, {
    onDelete: 'set null',
  }),
  // 'edit' = petugas edit data | 'verifikasi' = keputusan kepala bidang/admin
  tipeAksi: varchar('tipe_aksi', { length: 50 }).notNull().default('edit'),
  statusSebelum: varchar('status_sebelum', { length: 50 }),
  statusSesudah: varchar('status_sesudah', { length: 50 }),
  dataLama: json('data_lama'), // snapshot data laporan sebelum perubahan
  catatan: text('catatan'),
  createdAt: timestamp('created_at').defaultNow(),
})

// ─── Notifikasi ───────────────────────────────────────────────────────────────
// Persistensi notifikasi per-user untuk event laporan
export const notifikasi = mysqlTable('notifikasi', {
  idNotif: varchar('id_notif', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  idUserPenerima: varchar('id_user_penerima', { length: 36 })
    .notNull()
    .references(() => users.idUser, { onDelete: 'cascade' }),
  judul: varchar('judul', { length: 150 }).notNull(),
  pesan: text('pesan').notNull(),
  tipe: varchar('tipe', { length: 50 }).notNull(), // 'laporan_baru' | 'disetujui' | 'ditolak' | 'revisi'
  idReferensi: varchar('id_referensi', { length: 36 }), // id_laporan
  isRead: int('is_read').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
})

// ─── Log Aktivitas ─────────────────────────────────────────────────────────
// SRS F-12: Memantau seluruh aktivitas dan perubahan data
export const logAktivitas = mysqlTable('log_aktivitas', {
  idLog: varchar('id_log', { length: 36 }).primaryKey(),
  idUser: varchar('id_user', { length: 36 }).references(() => users.idUser, {
    onDelete: 'set null',
  }),
  aksi: varchar('aksi', { length: 100 }).notNull(),
  keterangan: text('keterangan'),
  ipAddress: varchar('ip_address', { length: 45 }),
  createdAt: timestamp('created_at').defaultNow(),
})

// ─── Relations ─────────────────────────────────────────────────────────────
export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
}))

export const bidangRelations = relations(bidang, ({ many }) => ({
  users: many(users),
  jenisKegiatan: many(jenisKegiatan),
}))

export const jenisKegiatanRelations = relations(jenisKegiatan, ({ one, many }) => ({
  bidang: one(bidang, { fields: [jenisKegiatan.idBidang], references: [bidang.idBidang] }),
  laporan: many(laporanKegiatan),
}))

export const lokasiTugasRelations = relations(lokasiTugas, ({ many }) => ({
  users: many(users),
}))

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, { fields: [users.idRole], references: [roles.idRole] }),
  bidang: one(bidang, { fields: [users.idBidang], references: [bidang.idBidang] }),
  lokasi: one(lokasiTugas, { fields: [users.idLokasi], references: [lokasiTugas.idLokasi] }),
  laporan: many(laporanKegiatan, { relationName: 'petugasLaporan' }),
  verifikasi: many(laporanKegiatan, { relationName: 'verifikatorLaporan' }),
  riwayat: many(riwayatRevisi),
  log: many(logAktivitas),
}))

export const laporanKegiatanRelations = relations(laporanKegiatan, ({ one, many }) => ({
  user: one(users, {
    fields: [laporanKegiatan.idUser],
    references: [users.idUser],
    relationName: 'petugasLaporan',
  }),
  verifikator: one(users, {
    fields: [laporanKegiatan.idVerifikator],
    references: [users.idUser],
    relationName: 'verifikatorLaporan',
  }),
  bidang: one(bidang, {
    fields: [laporanKegiatan.idBidang],
    references: [bidang.idBidang],
  }),
  jenisKegiatan: one(jenisKegiatan, {
    fields: [laporanKegiatan.idJenis],
    references: [jenisKegiatan.idJenis],
  }),
  dokumentasi: many(dokumentasiLaporan),
  riwayat: many(riwayatRevisi),
}))

export const dokumentasiLaporanRelations = relations(dokumentasiLaporan, ({ one }) => ({
  laporan: one(laporanKegiatan, {
    fields: [dokumentasiLaporan.idLaporan],
    references: [laporanKegiatan.idLaporan],
  }),
}))

export const riwayatRevisiRelations = relations(riwayatRevisi, ({ one }) => ({
  laporan: one(laporanKegiatan, {
    fields: [riwayatRevisi.idLaporan],
    references: [laporanKegiatan.idLaporan],
  }),
  user: one(users, { fields: [riwayatRevisi.idUser], references: [users.idUser] }),
}))

export const logAktivitasRelations = relations(logAktivitas, ({ one }) => ({
  user: one(users, { fields: [logAktivitas.idUser], references: [users.idUser] }),
}))

export const notifikasiRelations = relations(notifikasi, ({ one }) => ({
  user: one(users, { fields: [notifikasi.idUserPenerima], references: [users.idUser] }),
}))
