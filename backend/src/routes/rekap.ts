import { Elysia, t } from 'elysia'
import { eq, sql, inArray, desc } from 'drizzle-orm'
import { db } from '../db/connection'
import { laporanKegiatan, users, bidang, jenisKegiatan, dokumentasiLaporan } from '../db/schema'
import { authPlugin } from '../plugins/auth'
import type { UserPayload } from '../types'

export const rekapRoutes = new Elysia({ prefix: '/rekap' })
  .use(authPlugin)
  .onBeforeHandle((ctx) => {
    const user = (ctx as unknown as { user: UserPayload | null }).user
    if (!user) {
      ctx.set.status = 401
      return { message: 'Tidak terautentikasi' }
    }
    if (!['kepala_bidang', 'admin', 'pimpinan'].includes(user.namaRole)) {
      ctx.set.status = 403
      return { message: 'Akses ditolak' }
    }
  })

  // GET /rekap?periode=2026-05-15 (harian) atau 2026-05 (bulanan) atau 2026 (tahunan) & idBidang=xxx
  .get(
    '/',
    async (ctx) => {
      const query = ctx.query
      const user = (ctx as unknown as { user: UserPayload }).user
      const conditions = []

      if (query.periode) {
        if (query.periode.length === 10) { // YYYY-MM-DD
            conditions.push(sql`DATE(${laporanKegiatan.tanggalKegiatan}) = ${query.periode}`)
        } else if (query.periode.length === 7) { // YYYY-MM
            conditions.push(sql`DATE_FORMAT(${laporanKegiatan.tanggalKegiatan}, '%Y-%m') = ${query.periode}`)
        } else if (query.periode.length === 4) { // YYYY
            conditions.push(sql`DATE_FORMAT(${laporanKegiatan.tanggalKegiatan}, '%Y') = ${query.periode}`)
        }
      }

      if (user.namaRole === 'kepala_bidang') {
        if (user.idBidang) {
          conditions.push(eq(laporanKegiatan.idBidang, user.idBidang))
        } else {
          conditions.push(eq(laporanKegiatan.idBidang, ''))
        }
      } else if (query.idBidang) {
        conditions.push(eq(laporanKegiatan.idBidang, query.idBidang))
      }

      if (query.idUser) {
        conditions.push(eq(laporanKegiatan.idUser, query.idUser))
      }

      const whereClause =
        conditions.length > 0
          ? sql`${conditions.reduce((acc, cond, i) => (i === 0 ? cond : sql`${acc} AND ${cond}`))}`
          : undefined

      const rows = await db
        .select({
          idUser: laporanKegiatan.idUser,
          namaLengkap: users.namaLengkap,
          idBidang: users.idBidang,
          namaBidang: bidang.namaBidang,
          totalLaporan: sql<number>`COUNT(${laporanKegiatan.idLaporan})`,
          totalPeserta: sql<number>`COALESCE(SUM(${laporanKegiatan.jumlahPeserta}), 0)`,
          totalDisetujui: sql<number>`SUM(CASE WHEN ${laporanKegiatan.statusVerifikasi} = 'Disetujui' THEN 1 ELSE 0 END)`,
          totalMenunggu: sql<number>`SUM(CASE WHEN ${laporanKegiatan.statusVerifikasi} = 'Pending' THEN 1 ELSE 0 END)`,
          totalDitolak: sql<number>`SUM(CASE WHEN ${laporanKegiatan.statusVerifikasi} = 'Ditolak' THEN 1 ELSE 0 END)`,
          totalRevisi: sql<number>`SUM(CASE WHEN ${laporanKegiatan.statusVerifikasi} = 'Revisi' THEN 1 ELSE 0 END)`,
        })
        .from(laporanKegiatan)
        .leftJoin(users, eq(laporanKegiatan.idUser, users.idUser))
        .leftJoin(bidang, eq(users.idBidang, bidang.idBidang))
        .where(whereClause)
        .groupBy(laporanKegiatan.idUser, users.namaLengkap, users.idBidang, bidang.namaBidang)
        .orderBy(users.namaLengkap)

      return rows
    },
    {
      query: t.Object({
        periode: t.Optional(t.String()),
        idBidang: t.Optional(t.String()),
        idUser: t.Optional(t.String()),
      }),
    }
  )

  // GET /rekap/export-detail — full laporan data for export (with dokumentasi)
  .get(
    '/export-detail',
    async (ctx) => {
      const query = ctx.query
      const user = (ctx as unknown as { user: UserPayload }).user
      const conditions = []

      if (query.periode) {
        if (query.periode.length === 10) {
          conditions.push(sql`DATE(${laporanKegiatan.tanggalKegiatan}) = ${query.periode}`)
        } else if (query.periode.length === 7) {
          conditions.push(sql`DATE_FORMAT(${laporanKegiatan.tanggalKegiatan}, '%Y-%m') = ${query.periode}`)
        } else if (query.periode.length === 4) {
          conditions.push(sql`DATE_FORMAT(${laporanKegiatan.tanggalKegiatan}, '%Y') = ${query.periode}`)
        }
      }

      if (user.namaRole === 'kepala_bidang') {
        if (user.idBidang) {
          conditions.push(eq(laporanKegiatan.idBidang, user.idBidang))
        } else {
          conditions.push(eq(laporanKegiatan.idBidang, ''))
        }
      } else if (query.idBidang) {
        conditions.push(eq(laporanKegiatan.idBidang, query.idBidang))
      }

      const whereClause =
        conditions.length > 0
          ? sql`${conditions.reduce((acc, cond, i) => (i === 0 ? cond : sql`${acc} AND ${cond}`))}`
          : undefined

      const rows = await db
        .select({
          idLaporan: laporanKegiatan.idLaporan,
          tanggalKegiatan: laporanKegiatan.tanggalKegiatan,
          namaLengkap: users.namaLengkap,
          namaBidang: bidang.namaBidang,
          namaKegiatan: jenisKegiatan.namaKegiatan,
          lokasiDetail: laporanKegiatan.lokasiDetail,
          jumlahPeserta: laporanKegiatan.jumlahPeserta,
          deskripsiKegiatan: laporanKegiatan.deskripsiKegiatan,
          statusVerifikasi: laporanKegiatan.statusVerifikasi,
          catatanVerifikator: laporanKegiatan.catatanVerifikator,
        })
        .from(laporanKegiatan)
        .leftJoin(users, eq(laporanKegiatan.idUser, users.idUser))
        .leftJoin(bidang, eq(users.idBidang, bidang.idBidang))
        .leftJoin(jenisKegiatan, eq(laporanKegiatan.idJenis, jenisKegiatan.idJenis))
        .where(whereClause)
        .orderBy(users.namaLengkap, desc(laporanKegiatan.tanggalKegiatan))

      if (rows.length === 0) return []

      const idLaporanList = rows.map((r) => r.idLaporan)
      const allDokumentasi = await db
        .select({ idLaporan: dokumentasiLaporan.idLaporan, filePath: dokumentasiLaporan.filePath, tipeFile: dokumentasiLaporan.tipeFile })
        .from(dokumentasiLaporan)
        .where(inArray(dokumentasiLaporan.idLaporan, idLaporanList))

      const dokMap = new Map<string, { filePath: string; tipeFile: string | null }[]>()
      for (const d of allDokumentasi) {
        if (!dokMap.has(d.idLaporan)) dokMap.set(d.idLaporan, [])
        dokMap.get(d.idLaporan)!.push({ filePath: d.filePath, tipeFile: d.tipeFile })
      }

      return rows.map((r) => ({ ...r, dokumentasi: dokMap.get(r.idLaporan) ?? [] }))
    },
    {
      query: t.Object({
        periode: t.Optional(t.String()),
        idBidang: t.Optional(t.String()),
      }),
    }
  )