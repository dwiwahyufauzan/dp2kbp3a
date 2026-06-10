$content = @"
import {
  mysqlTable,
  varchar,
  text,
  int,
  timestamp,
  mysqlEnum,
  date,
  index,
} from 'drizzle-orm/mysql-core'
import { relations } from 'drizzle-orm'

export const roles = mysqlTable('roles', {
  idRole: varchar('id_role', { length: 36 }).primaryKey(),
  namaRole: varchar('nama_role', { length: 50 }).notNull().unique(),
})

export const bidang = mysqlTable('bidang', {
  idBidang: varchar('id_bidang', { length: 36 }).primaryKey(),
  namaBidang: varchar('nama_bidang', { length: 100 }).notNull(),
  deskripsi: text('deskripsi'),
})

export const jenisKegiatan = mysqlTable('jenis_kegiatan', {
  idJenis: varchar('id_jenis', { length: 36 }).primaryKey(),
  namaKegiatan: varchar('nama_kegiatan', { length: 100 }).notNull(),
})

export const lokasiTugas = mysqlTable('lokasi_tugas', {
  idLokasi: varchar('id_lokasi', { length: 36 }).primaryKey(),
  namaKecamatan: varchar('nama_kecamatan', { length: 100 }).notNull(),
  namaDesa: varchar('nama_desa_kelurahan', { length: 100 }).notNull(),
})

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
  password: text('password').notNull(),
  statusAktif: mysqlEnum('status_aktif', ['y', 'n']).notNull().default('y'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
})

export const laporanKegiatan = mysqlTable(
  'laporan_kegiatan',
  {
    idLaporan: varchar('id_laporan', { length: 36 }).primaryKey(),
    idUser: varchar('id_user', { length: 36 })
      .notNull()
      .references(() => users.idUser, { onDelete: 'restrict' }),
    idJenis: varchar('id_jenis', { length: 36 })
      .notNull()
      .references(() => jenisKegiatan.idJenis, { onDelete: 'restrict' }),
    tanggalKegiatan: date('tanggal_kegiatan').notNull(),
    lokasiDetail: text('lokasi_detail').notNull(),
    jumlahPeserta: int('jumlah_peserta').notNull(),
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
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
  },
  (table) => ({
    idxIdUser: index('idx_id_user').on(table.idUser),
    idxTanggal: index('idx_tanggal').on(table.tanggalKegiatan),
    idxStatus: index('idx_status').on(table.statusVerifikasi),
  })
)

export const dokumentasiLaporan = mysqlTable('dokumentasi_laporan', {
  idDokumentasi: varchar('id_dokumentasi', { length: 36 }).primaryKey(),
  idLaporan: varchar('id_laporan', { length: 36 })
    .notNull()
    .references(() => laporanKegiatan.idLaporan, { onDelete: 'cascade' }),
  filePath: text('file_path').notNull(),
  tipeFile: varchar('tipe_file', { length: 10 }),
})

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

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
}))

export const bidangRelations = relations(bidang, ({ many }) => ({
  users: many(users),
}))

export const jenisKegiatanRelations = relations(jenisKegiatan, ({ many }) => ({
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
  jenisKegiatan: one(jenisKegiatan, {
    fields: [laporanKegiatan.idJenis],
    references: [jenisKegiatan.idJenis],
  }),
  dokumentasi: many(dokumentasiLaporan),
}))

export const dokumentasiLaporanRelations = relations(dokumentasiLaporan, ({ one }) => ({
  laporan: one(laporanKegiatan, {
    fields: [dokumentasiLaporan.idLaporan],
    references: [laporanKegiatan.idLaporan],
  }),
}))

export const logAktivitasRelations = relations(logAktivitas, ({ one }) => ({
  user: one(users, { fields: [logAktivitas.idUser], references: [users.idUser] }),
}))
"@
Set-Content -Path "src\db\schema.ts" -Value $content -Encoding UTF8
Write-Host "OK lines: $((Get-Content src\db\schema.ts).Count)"
