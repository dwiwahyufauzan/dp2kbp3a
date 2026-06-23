import { Elysia } from 'elysia'
import { eq, and, desc, isNull } from 'drizzle-orm'
import { db } from '../db/connection'
import { laporanKegiatan, users, jenisKegiatan, bidang, notifikasi, dokumentasiLaporan } from '../db/schema'
import { authPlugin } from '../plugins/auth'
import type { UserPayload } from '../types'
import { clearCachePattern } from '../utils/cache'
import { hasPermission } from '../utils/permission'

export const verifikasiRoutes = new Elysia({ prefix: '/verifikasi' })
  .use(authPlugin)
  .onBeforeHandle(async (ctx) => {
    const u = (ctx as unknown as { user: UserPayload | null }).user
    if (!u) {
      ctx.set.status = 401
      return { message: 'Tidak terautentikasi' }
    }
    const canVerify = await hasPermission(u.namaRole, 'verifikasi_laporan')
    if (!canVerify) {
      ctx.set.status = 403
      return { message: 'Akses ditolak: Anda tidak memiliki izin untuk memverifikasi laporan' }
    }
  })

  // GET /verifikasi — daftar laporan Pending (antrian verifikasi)
  .get('/', async (ctx) => {
    const u = (ctx as unknown as { user: UserPayload }).user

    const conditions = [
      eq(laporanKegiatan.statusVerifikasi, 'Pending'),
      isNull(laporanKegiatan.deletedAt),
    ]

    // Kepala bidang hanya lihat laporan dari bidangnya
    if (u.namaRole === 'kepala_bidang') {
      if (u.idBidang) {
        conditions.push(eq(laporanKegiatan.idBidang, u.idBidang))
      } else {
        conditions.push(eq(laporanKegiatan.idBidang, ''))
      }
    }

    const rows = await db
      .select({
        idLaporan: laporanKegiatan.idLaporan,
        tanggalKegiatan: laporanKegiatan.tanggalKegiatan,
        lokasiDetail: laporanKegiatan.lokasiDetail,
        namaKegiatan: jenisKegiatan.namaKegiatan,
        jumlahPeserta: laporanKegiatan.jumlahPeserta,
        jumlahLaki: laporanKegiatan.jumlahLaki,
        jumlahPerempuan: laporanKegiatan.jumlahPerempuan,
        deskripsiKegiatan: laporanKegiatan.deskripsiKegiatan,
        statusVerifikasi: laporanKegiatan.statusVerifikasi,
        namaLengkap: users.namaLengkap,
        namaBidang: bidang.namaBidang,
        createdAt: laporanKegiatan.createdAt,
      })
      .from(laporanKegiatan)
      .leftJoin(jenisKegiatan, eq(laporanKegiatan.idJenis, jenisKegiatan.idJenis))
      .leftJoin(users, eq(laporanKegiatan.idUser, users.idUser))
      .leftJoin(bidang, eq(users.idBidang, bidang.idBidang))
      .where(and(...conditions))
      .orderBy(desc(laporanKegiatan.createdAt))

    const idList = rows.map(r => r.idLaporan)
    const dokumenMap = new Map<string, { idDokumentasi: string; idLaporan: string; filePath: string; tipeFile: string | null }[]>()
    if (idList.length > 0) {
      const allDok = await Promise.all(
        idList.map(id => db.select().from(dokumentasiLaporan).where(eq(dokumentasiLaporan.idLaporan, id)))
      )
      idList.forEach((id, i) => dokumenMap.set(id, allDok[i] ?? []))
    }

    return rows.map(r => ({ ...r, dokumentasi: dokumenMap.get(r.idLaporan) ?? [] }))
  })

  // POST /verifikasi/:id — keputusan verifikasi (terpadu, kirim notif)
  .post('/:id', async (ctx) => {
    const { params, body, set } = ctx
    const u = (ctx as unknown as { user: UserPayload }).user
    const b = body as { statusVerifikasi: string; catatanVerifikator?: string }

    if (!['Disetujui', 'Ditolak', 'Revisi'].includes(b.statusVerifikasi)) {
      set.status = 400
      return { message: 'Status tidak valid' }
    }

    const [laporan] = await db
      .select({ 
        idLaporan: laporanKegiatan.idLaporan, 
        idUser: laporanKegiatan.idUser, 
        idBidang: laporanKegiatan.idBidang,
        namaKegiatan: jenisKegiatan.namaKegiatan 
      })
      .from(laporanKegiatan)
      .leftJoin(jenisKegiatan, eq(laporanKegiatan.idJenis, jenisKegiatan.idJenis))
      .where(and(eq(laporanKegiatan.idLaporan, params.id), isNull(laporanKegiatan.deletedAt)))
      .limit(1)

    if (!laporan) {
      set.status = 404
      return { message: 'Laporan tidak ditemukan' }
    }

    if (u.namaRole === 'kepala_bidang' && (!u.idBidang || laporan.idBidang !== u.idBidang)) {
      set.status = 403
      return { message: 'Akses ditolak: Anda hanya dapat memverifikasi laporan di bidang Anda' }
    }

    // Update status
    await db
      .update(laporanKegiatan)
      .set({
        statusVerifikasi: b.statusVerifikasi as 'Disetujui' | 'Ditolak' | 'Revisi',
        catatanVerifikator: b.catatanVerifikator ?? null,
        idVerifikator: u.idUser,
      })
      .where(eq(laporanKegiatan.idLaporan, params.id))

    // Kirim notifikasi ke petugas
    const tipeMap: Record<string, string> = {
      Disetujui: 'disetujui',
      Ditolak: 'ditolak',
      Revisi: 'revisi',
    }
    const judulMap: Record<string, string> = {
      Disetujui: 'Laporan Disetujui',
      Ditolak: 'Laporan Ditolak',
      Revisi: 'Laporan Perlu Revisi',
    }
    const pesanMap: Record<string, string> = {
      Disetujui: `Laporan "${laporan.namaKegiatan}" Anda telah disetujui.`,
      Ditolak: `Laporan "${laporan.namaKegiatan}" Anda ditolak. ${b.catatanVerifikator ? 'Catatan: ' + b.catatanVerifikator : ''}`,
      Revisi: `Laporan "${laporan.namaKegiatan}" perlu direvisi. ${b.catatanVerifikator ? 'Catatan: ' + b.catatanVerifikator : ''}`,
    }

    await db.insert(notifikasi).values([{
      idUserPenerima: laporan.idUser,
      judul: judulMap[b.statusVerifikasi] ?? 'Notifikasi Laporan',
      pesan: pesanMap[b.statusVerifikasi] ?? '',
      tipe: tipeMap[b.statusVerifikasi] ?? b.statusVerifikasi.toLowerCase(),
      idReferensi: params.id,
      isRead: 0,
    }])

    clearCachePattern('stats:')
    return { message: `Laporan berhasil ${b.statusVerifikasi.toLowerCase()}` }
  })
