import { Elysia, t } from 'elysia'
import { sql, eq } from 'drizzle-orm'
import { db } from '../db/connection'
import { laporanKegiatan, users, jenisKegiatan } from '../db/schema'
import { authPlugin } from '../plugins/auth'
import type { UserPayload } from '../types'
import { getCache, setCache } from '../utils/cache'
import { hasPermission } from '../utils/permission'

export const statistikRoutes = new Elysia({ prefix: '/statistik' })
  .use(authPlugin)
  .onBeforeHandle(async (ctx) => {
    const user = (ctx as unknown as { user: UserPayload | null }).user
    if (!user) {
      ctx.set.status = 401
      return { message: 'Tidak terautentikasi' }
    }
    const canView = await hasPermission(user.namaRole, 'lihat_statistik')
    if (!canView) {
      ctx.set.status = 403
      return { message: 'Akses ditolak: Anda tidak memiliki izin untuk melihat statistik' }
    }
  })

  // GET /statistik?tahun=2026&bulan=5&idBidang=xxx
  .get(
    '/',
    async (ctx) => {
      const query = ctx.query
      const user = (ctx as unknown as { user: UserPayload }).user

      // Check Cache
      const cacheKey = `stats:${user.namaRole}:${user.idBidang ?? 'all'}:${query.tahun ?? 'none'}:${query.bulan ?? 'none'}:${query.idBidang ?? 'none'}`
      const cached = getCache(cacheKey)
      if (cached) {
        return cached
      }

      const conditions: ReturnType<typeof sql>[] = [sql`${laporanKegiatan.deletedAt} IS NULL`]

      if (query.tahun) {
        conditions.push(sql`YEAR(${laporanKegiatan.tanggalKegiatan}) = ${Number(query.tahun)}`)
      }
      if (query.bulan) {
        conditions.push(sql`MONTH(${laporanKegiatan.tanggalKegiatan}) = ${Number(query.bulan)}`)
      }
      
      if (user.namaRole === 'kepala_bidang') {
        if (user.idBidang) {
          conditions.push(eq(laporanKegiatan.idBidang, user.idBidang))
        } else {
          conditions.push(eq(laporanKegiatan.idBidang, ''))
        }
      } else if (user.namaRole === 'petugas') {
        conditions.push(eq(laporanKegiatan.idUser, user.idUser))
      } else if (query.idBidang) {
        conditions.push(eq(laporanKegiatan.idBidang, query.idBidang))
      }

      const whereClause =
        conditions.length > 0
          ? conditions.reduce((acc, cond) => sql`${acc} AND ${cond}`)
          : sql`1 = 1`

      const [totals] = await db
        .select({
          totalLaporan: sql<number>`COUNT(${laporanKegiatan.idLaporan})`,
          totalPeserta: sql<number>`COALESCE(SUM(${laporanKegiatan.jumlahPeserta}), 0)`,
          totalLaki: sql<number>`COALESCE(SUM(${laporanKegiatan.jumlahLaki}), 0)`,
          totalPerempuan: sql<number>`COALESCE(SUM(${laporanKegiatan.jumlahPerempuan}), 0)`,
        })
        .from(laporanKegiatan)
        .leftJoin(users, eq(laporanKegiatan.idUser, users.idUser))
        .where(whereClause)

      const byStatus = await db
        .select({
          statusVerifikasi: laporanKegiatan.statusVerifikasi,
          total: sql<number>`COUNT(${laporanKegiatan.idLaporan})`,
        })
        .from(laporanKegiatan)
        .leftJoin(users, eq(laporanKegiatan.idUser, users.idUser))
        .where(whereClause)
        .groupBy(laporanKegiatan.statusVerifikasi)

      const byJenis = await db
        .select({
          idJenis: laporanKegiatan.idJenis,
          namaKegiatan: jenisKegiatan.namaKegiatan,
          total: sql<number>`COUNT(${laporanKegiatan.idLaporan})`,
          totalPeserta: sql<number>`COALESCE(SUM(${laporanKegiatan.jumlahPeserta}), 0)`,
        })
        .from(laporanKegiatan)
        .leftJoin(users, eq(laporanKegiatan.idUser, users.idUser))
        .leftJoin(jenisKegiatan, eq(laporanKegiatan.idJenis, jenisKegiatan.idJenis))
        .where(whereClause)
        .groupBy(laporanKegiatan.idJenis, jenisKegiatan.namaKegiatan)
        .orderBy(sql`COUNT(${laporanKegiatan.idLaporan}) DESC`)

      const trenConditions: ReturnType<typeof sql>[] = [sql`${laporanKegiatan.deletedAt} IS NULL`]
      const yearToUse = query.tahun ? Number(query.tahun) : new Date().getFullYear()
      trenConditions.push(sql`YEAR(${laporanKegiatan.tanggalKegiatan}) = ${yearToUse}`)
      
      if (user.namaRole === 'kepala_bidang') {
        if (user.idBidang) {
          trenConditions.push(eq(laporanKegiatan.idBidang, user.idBidang))
        } else {
          trenConditions.push(eq(laporanKegiatan.idBidang, ''))
        }
      } else if (user.namaRole === 'petugas') {
        trenConditions.push(eq(laporanKegiatan.idUser, user.idUser))
      } else if (query.idBidang) {
        trenConditions.push(eq(laporanKegiatan.idBidang, query.idBidang))
      }

      const trenWhere = trenConditions.reduce((acc, cond) => sql`${acc} AND ${cond}`)

      const trenBulanRaw = await db
        .select({
          bulan: sql<number>`MONTH(${laporanKegiatan.tanggalKegiatan})`,
          total: sql<number>`COUNT(${laporanKegiatan.idLaporan})`,
          totalPeserta: sql<number>`COALESCE(SUM(${laporanKegiatan.jumlahPeserta}), 0)`,
        })
        .from(laporanKegiatan)
        .leftJoin(users, eq(laporanKegiatan.idUser, users.idUser))
        .where(trenWhere)
        .groupBy(sql`MONTH(${laporanKegiatan.tanggalKegiatan})`)

      const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
      const trenMap = new Map(trenBulanRaw.map(r => [Number(r.bulan), r]))

      const trenBulan = Array.from({ length: 12 }, (_, i) => {
        const m = i + 1
        const data = trenMap.get(m)
        return {
          periode: monthNames[i],
          total: data ? Number(data.total) : 0,
          totalPeserta: data ? Number(data.totalPeserta) : 0,
        }
      })

      const statusMap: Record<string, number> = {}
      for (const row of byStatus) {
        statusMap[row.statusVerifikasi] = Number(row.total)
      }

      const data = {
        totalLaporan: Number(totals?.totalLaporan ?? 0),
        totalPeserta: Number(totals?.totalPeserta ?? 0),
        totalLaki: Number(totals?.totalLaki ?? 0),
        totalPerempuan: Number(totals?.totalPerempuan ?? 0),
        byStatus: {
          Pending: statusMap['Pending'] ?? 0,
          Disetujui: statusMap['Disetujui'] ?? 0,
          Ditolak: statusMap['Ditolak'] ?? 0,
          Revisi: statusMap['Revisi'] ?? 0,
        },
        byJenis: byJenis.map((r) => ({
          idJenis: r.idJenis,
          namaKegiatan: r.namaKegiatan,
          total: Number(r.total),
          totalPeserta: Number(r.totalPeserta),
        })),
        trenBulan: trenBulan.map((r) => ({
          periode: r.periode,
          total: Number(r.total),
          totalPeserta: Number(r.totalPeserta),
        })),
      }

      setCache(cacheKey, data, 5 * 60_000) // Cache selama 5 menit
      return data
    },
    {
      query: t.Object({
        tahun: t.Optional(t.String({ pattern: '^\\d{4}$' })),
        bulan: t.Optional(t.String({ pattern: '^([1-9]|1[0-2])$' })),
        idBidang: t.Optional(t.String()),
      }),
    }
  )
