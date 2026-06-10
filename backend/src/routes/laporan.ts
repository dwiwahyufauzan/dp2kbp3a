import { Elysia, t } from 'elysia'
import { eq, desc, count, and, like, SQL } from 'drizzle-orm'
import { join } from 'node:path'
import { mkdir } from 'node:fs/promises'
import { db } from '../db/connection'
import { laporanKegiatan, users, jenisKegiatan, dokumentasiLaporan, notifikasi, roles, riwayatRevisi, bidang } from '../db/schema'
import { authPlugin } from '../plugins/auth'
import { catatLog } from './log-aktivitas'
import type { UserPayload } from '../types'

const UPLOAD_DIR = join(import.meta.dir, '../../uploads')

// MIME types yang diizinkan untuk upload dokumentasi
const ALLOWED_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
  'application/zip': 'zip',
  'application/x-zip-compressed': 'zip',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/msword': 'doc',
  'application/vnd.ms-excel': 'xls',
}

export const laporanRoutes = new Elysia({ prefix: '/laporan' })
  .use(authPlugin)
  .onBeforeHandle((ctx) => {
    const user = (ctx as unknown as { user: UserPayload | null }).user
    if (!user) {
      ctx.set.status = 401
      return { message: 'Tidak terautentikasi' }
    }
  })

  // GET /laporan/count-pending — jumlah laporan Pending sesuai bidang (untuk badge sidebar)
  .get('/count-pending', async (ctx) => {
    const u = (ctx as unknown as { user: UserPayload }).user
    if (!['kepala_bidang', 'admin'].includes(u.namaRole)) {
      return { count: 0 }
    }

    const conditions: SQL[] = [eq(laporanKegiatan.statusVerifikasi, 'Pending')]
    // Kepala bidang: hanya hitung pending di bidangnya
    if (u.namaRole === 'kepala_bidang' && u.idBidang) {
      conditions.push(eq(laporanKegiatan.idBidang, u.idBidang))
    }

    const [result] = await db
      .select({ total: count() })
      .from(laporanKegiatan)
      .where(and(...conditions))
    return { count: result?.total ?? 0 }
  })

  // GET /laporan — daftar laporan dengan pagination & filter
  .get('/', async (ctx) => {
    const u = (ctx as unknown as { user: UserPayload }).user
    const query = (ctx as unknown as { query: Record<string, string> }).query

    const page  = Math.max(1, parseInt(query.page  ?? '1',  10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '15', 10) || 15))
    const offset = (page - 1) * limit
    const status = query.status ?? ''
    const search = query.search ?? ''

    // Susun kondisi WHERE dinamis
    const conditions: SQL[] = []

    if (u.namaRole === 'petugas') {
      // Petugas: hanya lihat laporannya sendiri
      conditions.push(eq(laporanKegiatan.idUser, u.idUser))
    } else if (u.namaRole === 'kepala_bidang') {
      // Kepala bidang: hanya lihat laporan yang dibuat di bidangnya
      if (u.idBidang) {
        conditions.push(eq(laporanKegiatan.idBidang, u.idBidang))
      }
    }
    // Admin & pimpinan: lihat semua

    if (status) {
      conditions.push(eq(laporanKegiatan.statusVerifikasi, status as 'Pending' | 'Disetujui' | 'Ditolak' | 'Revisi'))
    }
    if (search) {
      conditions.push(like(laporanKegiatan.lokasiDetail, `%${search}%`))
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined

    const baseSelect = {
      idLaporan: laporanKegiatan.idLaporan,
      tanggalKegiatan: laporanKegiatan.tanggalKegiatan,
      lokasiDetail: laporanKegiatan.lokasiDetail,
      idJenis: laporanKegiatan.idJenis,
      namaKegiatan: jenisKegiatan.namaKegiatan,
      idBidang: laporanKegiatan.idBidang,
      namaBidang: bidang.namaBidang,
      jumlahPeserta: laporanKegiatan.jumlahPeserta,
      deskripsiKegiatan: laporanKegiatan.deskripsiKegiatan,
      statusVerifikasi: laporanKegiatan.statusVerifikasi,
      catatanVerifikator: laporanKegiatan.catatanVerifikator,
      createdAt: laporanKegiatan.createdAt,
      updatedAt: laporanKegiatan.updatedAt,
    }

    const [totalResult, data] = await Promise.all([
      db
        .select({ total: count() })
        .from(laporanKegiatan)
        .leftJoin(jenisKegiatan, eq(laporanKegiatan.idJenis, jenisKegiatan.idJenis))
        .leftJoin(bidang, eq(laporanKegiatan.idBidang, bidang.idBidang))
        .where(where),
      db
        .select({ ...baseSelect, idUser: laporanKegiatan.idUser, namaLengkap: users.namaLengkap })
        .from(laporanKegiatan)
        .leftJoin(users, eq(laporanKegiatan.idUser, users.idUser))
        .leftJoin(jenisKegiatan, eq(laporanKegiatan.idJenis, jenisKegiatan.idJenis))
        .leftJoin(bidang, eq(laporanKegiatan.idBidang, bidang.idBidang))
        .where(where)
        .orderBy(desc(laporanKegiatan.tanggalKegiatan))
        .limit(limit)
        .offset(offset),
    ])

    const total = totalResult[0]?.total ?? 0
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  })

  // GET /laporan/:id — detail laporan beserta dokumentasi dan riwayat revisi
  .get('/:id', async (ctx) => {
    const { params, set } = ctx
    const u = (ctx as unknown as { user: UserPayload }).user

    const [row] = await db
      .select({
        idLaporan: laporanKegiatan.idLaporan,
        tanggalKegiatan: laporanKegiatan.tanggalKegiatan,
        lokasiDetail: laporanKegiatan.lokasiDetail,
        idJenis: laporanKegiatan.idJenis,
        namaKegiatan: jenisKegiatan.namaKegiatan,
        idBidang: laporanKegiatan.idBidang,
        namaBidang: bidang.namaBidang,
        jumlahPeserta: laporanKegiatan.jumlahPeserta,
        jumlahLaki: laporanKegiatan.jumlahLaki,
        jumlahPerempuan: laporanKegiatan.jumlahPerempuan,
        deskripsiKegiatan: laporanKegiatan.deskripsiKegiatan,
        statusVerifikasi: laporanKegiatan.statusVerifikasi,
        catatanVerifikator: laporanKegiatan.catatanVerifikator,
        idUser: laporanKegiatan.idUser,
        namaLengkap: users.namaLengkap,
        idVerifikator: laporanKegiatan.idVerifikator,
        createdAt: laporanKegiatan.createdAt,
        updatedAt: laporanKegiatan.updatedAt,
      })
      .from(laporanKegiatan)
      .leftJoin(users, eq(laporanKegiatan.idUser, users.idUser))
      .leftJoin(jenisKegiatan, eq(laporanKegiatan.idJenis, jenisKegiatan.idJenis))
      .leftJoin(bidang, eq(laporanKegiatan.idBidang, bidang.idBidang))
      .where(eq(laporanKegiatan.idLaporan, params.id))
      .limit(1)

    if (!row) {
      set.status = 404
      return { message: 'Laporan tidak ditemukan' }
    }
    if (u.namaRole === 'petugas' && row.idUser !== u.idUser) {
      set.status = 403
      return { message: 'Akses ditolak' }
    }
    // Kepala bidang: hanya boleh lihat laporan di bidangnya
    if (u.namaRole === 'kepala_bidang' && u.idBidang && row.idBidang !== u.idBidang) {
      set.status = 403
      return { message: 'Akses ditolak' }
    }

    // Ambil dokumentasi
    const dokumen = await db
      .select()
      .from(dokumentasiLaporan)
      .where(eq(dokumentasiLaporan.idLaporan, params.id))

    // Ambil riwayat revisi
    const riwayat = await db
      .select({
        idRiwayat: riwayatRevisi.idRiwayat,
        tipeAksi: riwayatRevisi.tipeAksi,
        statusSebelum: riwayatRevisi.statusSebelum,
        statusSesudah: riwayatRevisi.statusSesudah,
        dataLama: riwayatRevisi.dataLama,
        catatan: riwayatRevisi.catatan,
        createdAt: riwayatRevisi.createdAt,
        namaUser: users.namaLengkap,
      })
      .from(riwayatRevisi)
      .leftJoin(users, eq(riwayatRevisi.idUser, users.idUser))
      .where(eq(riwayatRevisi.idLaporan, params.id))
      .orderBy(desc(riwayatRevisi.createdAt))

    return { ...row, dokumentasi: dokumen, riwayatRevisi: riwayat }
  })

  // POST /laporan — input laporan baru
  .post(
    '/',
    async (ctx) => {
      const { body, set } = ctx
      const u = (ctx as unknown as { user: UserPayload }).user

      if (!['petugas', 'admin'].includes(u.namaRole)) {
        set.status = 403
        return { message: 'Hanya petugas atau admin yang dapat menginput laporan' }
      }

      // Validasi bidang
      const [bidangRow] = await db
        .select({ idBidang: bidang.idBidang })
        .from(bidang)
        .where(eq(bidang.idBidang, body.idBidang))
        .limit(1)
      if (!bidangRow) {
        set.status = 400
        return { message: 'Bidang tidak ditemukan' }
      }

      // Validasi kegiatan harus sesuai bidang yang dipilih
      const [kegiatan] = await db
        .select({ idJenis: jenisKegiatan.idJenis, idBidang: jenisKegiatan.idBidang })
        .from(jenisKegiatan)
        .where(eq(jenisKegiatan.idJenis, body.idJenis))
        .limit(1)
      if (!kegiatan) {
        set.status = 400
        return { message: 'Jenis kegiatan tidak ditemukan' }
      }
      if (kegiatan.idBidang && kegiatan.idBidang !== body.idBidang) {
        set.status = 400
        return { message: 'Jenis kegiatan tidak sesuai dengan bidang yang dipilih' }
      }

      const idLaporan = crypto.randomUUID()
      const idUser = u.namaRole === 'admin' && body.idUser ? body.idUser : u.idUser

      await db.insert(laporanKegiatan).values({
        idLaporan,
        idUser,
        idBidang: body.idBidang,
        idJenis: body.idJenis,
        tanggalKegiatan: new Date(body.tanggalKegiatan),
        lokasiDetail: body.lokasiDetail.trim(),
        jumlahPeserta: body.jumlahPeserta,
        jumlahLaki: body.jumlahLaki ?? null,
        jumlahPerempuan: body.jumlahPerempuan ?? null,
        deskripsiKegiatan: body.deskripsiKegiatan?.trim(),
      })

      const ip = ctx.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? undefined
      await catatLog({ idUser: u.idUser, aksi: 'BUAT_LAPORAN', keterangan: `Laporan baru: ${idLaporan}`, ipAddress: ip }).catch(() => {})

      // Kirim notifikasi ke kepala_bidang di bidang yang dipilih + admin
      try {
        const targets = await db
          .select({ idUser: users.idUser, namaRole: roles.namaRole, idBidang: users.idBidang })
          .from(users)
          .leftJoin(roles, eq(users.idRole, roles.idRole))
          .where(eq(users.statusAktif, 'y'))

        const notifTargets = targets.filter(t =>
          t.namaRole === 'admin' ||
          (t.namaRole === 'kepala_bidang' && t.idBidang === body.idBidang)
        )

        await Promise.all(
          notifTargets.map(t =>
            db.insert(notifikasi).values({
              idUserPenerima: t.idUser,
              judul: 'Laporan Baru Masuk',
              pesan: `Ada laporan baru di bidang yang membutuhkan verifikasi Anda.`,
              tipe: 'laporan_baru',
              idReferensi: idLaporan,
              isRead: 0,
            })
          )
        )
      } catch { /* notifikasi tidak boleh gagalkan laporan */ }

      return { idLaporan, message: 'Laporan berhasil disimpan' }
    },
    {
      body: t.Object({
        tanggalKegiatan: t.String({ pattern: '^\\d{4}-\\d{2}-\\d{2}$' }),
        lokasiDetail: t.String({ minLength: 3 }),
        idBidang: t.String({ minLength: 1 }),
        idJenis: t.String({ minLength: 1 }),
        jumlahPeserta: t.Number({ minimum: 1 }),
        jumlahLaki: t.Optional(t.Nullable(t.Number({ minimum: 0 }))),
        jumlahPerempuan: t.Optional(t.Nullable(t.Number({ minimum: 0 }))),
        deskripsiKegiatan: t.Optional(t.String({ maxLength: 2000 })),
        idUser: t.Optional(t.String()),
      }),
    }
  )

  // PATCH /laporan/:id — update laporan (status Pending/Revisi)
  .patch(
    '/:id',
    async (ctx) => {
      const { params, body, set } = ctx
      const u = (ctx as unknown as { user: UserPayload }).user

      const [existing] = await db
        .select()
        .from(laporanKegiatan)
        .where(eq(laporanKegiatan.idLaporan, params.id))
        .limit(1)

      if (!existing) {
        set.status = 404
        return { message: 'Laporan tidak ditemukan' }
      }
      if (existing.idUser !== u.idUser && u.namaRole !== 'admin') {
        set.status = 403
        return { message: 'Akses ditolak' }
      }
      if (!['Pending', 'Revisi'].includes(existing.statusVerifikasi)) {
        set.status = 400
        return { message: 'Laporan yang sudah diverifikasi tidak dapat diubah' }
      }

      // Jika ganti bidang, validasi kegiatan sesuai bidang baru
      const newIdBidang = body.idBidang ?? existing.idBidang
      if (body.idJenis) {
        const [kegiatan] = await db
          .select({ idJenis: jenisKegiatan.idJenis, idBidang: jenisKegiatan.idBidang })
          .from(jenisKegiatan)
          .where(eq(jenisKegiatan.idJenis, body.idJenis))
          .limit(1)
        if (!kegiatan) {
          set.status = 400
          return { message: 'Jenis kegiatan tidak ditemukan' }
        }
        if (kegiatan.idBidang && kegiatan.idBidang !== newIdBidang) {
          set.status = 400
          return { message: 'Jenis kegiatan tidak sesuai dengan bidang' }
        }
      }

      // Simpan snapshot ke riwayat_revisi
      await db.insert(riwayatRevisi).values({
        idRiwayat: crypto.randomUUID(),
        idLaporan: params.id,
        idUser: u.idUser,
        tipeAksi: 'edit',
        statusSebelum: existing.statusVerifikasi,
        statusSesudah: 'Pending',
        dataLama: {
          idBidang: existing.idBidang,
          idJenis: existing.idJenis,
          tanggalKegiatan: existing.tanggalKegiatan,
          lokasiDetail: existing.lokasiDetail,
          jumlahPeserta: existing.jumlahPeserta,
          jumlahLaki: existing.jumlahLaki,
          jumlahPerempuan: existing.jumlahPerempuan,
          deskripsiKegiatan: existing.deskripsiKegiatan,
        },
        catatan: 'Data laporan diperbarui',
      })

      await db
        .update(laporanKegiatan)
        .set({
          idBidang: body.idBidang ?? existing.idBidang,
          tanggalKegiatan: body.tanggalKegiatan ? new Date(body.tanggalKegiatan) : existing.tanggalKegiatan,
          lokasiDetail: body.lokasiDetail ? body.lokasiDetail.trim() : existing.lokasiDetail,
          idJenis: body.idJenis ?? existing.idJenis,
          jumlahPeserta: body.jumlahPeserta ?? existing.jumlahPeserta,
          jumlahLaki: body.jumlahLaki !== undefined ? body.jumlahLaki : existing.jumlahLaki,
          jumlahPerempuan: body.jumlahPerempuan !== undefined ? body.jumlahPerempuan : existing.jumlahPerempuan,
          deskripsiKegiatan: body.deskripsiKegiatan !== undefined ? body.deskripsiKegiatan?.trim() : existing.deskripsiKegiatan,
          statusVerifikasi: 'Pending',
        })
        .where(eq(laporanKegiatan.idLaporan, params.id))

      return { message: 'Laporan berhasil diperbarui' }
    },
    {
      body: t.Object({
        idBidang: t.Optional(t.String({ minLength: 1 })),
        tanggalKegiatan: t.Optional(t.String({ pattern: '^\\d{4}-\\d{2}-\\d{2}$' })),
        lokasiDetail: t.Optional(t.String({ minLength: 3 })),
        idJenis: t.Optional(t.String({ minLength: 1 })),
        jumlahPeserta: t.Optional(t.Number({ minimum: 1 })),
        jumlahLaki: t.Optional(t.Nullable(t.Number({ minimum: 0 }))),
        jumlahPerempuan: t.Optional(t.Nullable(t.Number({ minimum: 0 }))),
        deskripsiKegiatan: t.Optional(t.Nullable(t.String({ maxLength: 2000 }))),
      }),
    }
  )

  // PATCH /laporan/:id/verifikasi — verifikasi laporan
  .patch(
    '/:id/verifikasi',
    async (ctx) => {
      const { params, body, set } = ctx
      const u = (ctx as unknown as { user: UserPayload }).user

      if (!['kepala_bidang', 'admin'].includes(u.namaRole)) {
        set.status = 403
        return { message: 'Hanya kepala bidang atau admin yang dapat memverifikasi' }
      }

      const [existing] = await db
        .select({ idLaporan: laporanKegiatan.idLaporan, statusVerifikasi: laporanKegiatan.statusVerifikasi, idBidang: laporanKegiatan.idBidang, idUser: laporanKegiatan.idUser })
        .from(laporanKegiatan)
        .where(eq(laporanKegiatan.idLaporan, params.id))
        .limit(1)

      if (!existing) {
        set.status = 404
        return { message: 'Laporan tidak ditemukan' }
      }
      // Kepala bidang hanya boleh verifikasi laporan di bidangnya
      if (u.namaRole === 'kepala_bidang' && u.idBidang && existing.idBidang !== u.idBidang) {
        set.status = 403
        return { message: 'Anda hanya dapat memverifikasi laporan di bidang Anda' }
      }
      if (existing.statusVerifikasi === 'Disetujui') {
        set.status = 400
        return { message: 'Laporan sudah disetujui sebelumnya' }
      }

      // Simpan ke riwayat revisi
      await db.insert(riwayatRevisi).values({
        idRiwayat: crypto.randomUUID(),
        idLaporan: params.id,
        idUser: u.idUser,
        tipeAksi: 'verifikasi',
        statusSebelum: existing.statusVerifikasi,
        statusSesudah: body.statusVerifikasi,
        dataLama: null,
        catatan: body.catatanVerifikator?.trim() ?? null,
      })

      await db
        .update(laporanKegiatan)
        .set({
          statusVerifikasi: body.statusVerifikasi,
          catatanVerifikator: body.catatanVerifikator?.trim() ?? null,
          idVerifikator: u.idUser,
        })
        .where(eq(laporanKegiatan.idLaporan, params.id))

      // Kirim notifikasi ke petugas
      try {
        const statusLabel = body.statusVerifikasi === 'Disetujui' ? 'disetujui' : body.statusVerifikasi === 'Ditolak' ? 'ditolak' : 'diminta revisi'
        await db.insert(notifikasi).values({
          idUserPenerima: existing.idUser,
          judul: `Laporan ${body.statusVerifikasi}`,
          pesan: `Laporan Anda telah ${statusLabel} oleh verifikator.${body.catatanVerifikator ? ' Catatan: ' + body.catatanVerifikator : ''}`,
          tipe: body.statusVerifikasi === 'Disetujui' ? 'disetujui' : body.statusVerifikasi === 'Ditolak' ? 'ditolak' : 'revisi',
          idReferensi: params.id,
          isRead: 0,
        })
      } catch { /* abaikan */ }

      const ip2 = ctx.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? undefined
      await catatLog({ idUser: u.idUser, aksi: 'VERIFIKASI_LAPORAN', keterangan: `Laporan ${params.id} → ${body.statusVerifikasi}`, ipAddress: ip2 }).catch(() => {})

      return { message: 'Verifikasi berhasil disimpan' }
    },
    {
      body: t.Object({
        statusVerifikasi: t.Union([t.Literal('Disetujui'), t.Literal('Ditolak'), t.Literal('Revisi')]),
        catatanVerifikator: t.Optional(t.Nullable(t.String({ maxLength: 1000 }))),
      }),
    }
  )

  // POST /laporan/:id/dokumentasi — upload file
  .post(
    '/:id/dokumentasi',
    async (ctx) => {
      const { params, body, set } = ctx
      const u = (ctx as unknown as { user: UserPayload }).user

      const [existing] = await db
        .select({ idUser: laporanKegiatan.idUser })
        .from(laporanKegiatan)
        .where(eq(laporanKegiatan.idLaporan, params.id))
        .limit(1)

      if (!existing) {
        set.status = 404
        return { message: 'Laporan tidak ditemukan' }
      }
      if (existing.idUser !== u.idUser && u.namaRole !== 'admin') {
        set.status = 403
        return { message: 'Akses ditolak' }
      }

      const file = body.file as File
      if (!ALLOWED_MIME[file.type]) {
        set.status = 400
        return { message: 'Tipe file tidak diizinkan. Gunakan: JPG, PNG, GIF, WEBP, PDF, ZIP, DOCX, XLSX, DOC, XLS.' }
      }
      if (file.size > 20 * 1024 * 1024) {
        set.status = 400
        return { message: 'Ukuran file maksimal 20 MB.' }
      }

      await mkdir(UPLOAD_DIR, { recursive: true })
      const allowedExt = ALLOWED_MIME[file.type]
      const ext = allowedExt || (file.name.split('.').pop() ?? 'bin').toLowerCase().replace(/[^a-z0-9]/g, '')
      const filename = `${crypto.randomUUID()}.${ext}`
      await Bun.write(`${UPLOAD_DIR}/${filename}`, file)

      const idDokumentasi = crypto.randomUUID()
      await db.insert(dokumentasiLaporan).values({
        idDokumentasi,
        idLaporan: params.id,
        filePath: filename,
        tipeFile: file.type,
        namaAsli: file.name,
      })

      return { idDokumentasi, filename, message: 'Dokumentasi berhasil ditambahkan' }
    },
    { body: t.Object({ file: t.File({ maxSize: '20m' }) }) }
  )

  // DELETE /laporan/:id/dokumentasi/:idDok
  .delete('/:id/dokumentasi/:idDok', async (ctx) => {
    const { params, set } = ctx
    const u = (ctx as unknown as { user: UserPayload }).user

    const [dok] = await db
      .select({ idLaporan: dokumentasiLaporan.idLaporan })
      .from(dokumentasiLaporan)
      .where(eq(dokumentasiLaporan.idDokumentasi, params.idDok))
      .limit(1)

    if (!dok) { set.status = 404; return { message: 'Dokumentasi tidak ditemukan' } }

    const [lap] = await db
      .select({ idUser: laporanKegiatan.idUser })
      .from(laporanKegiatan)
      .where(eq(laporanKegiatan.idLaporan, dok.idLaporan))
      .limit(1)

    if (lap && lap.idUser !== u.idUser && u.namaRole !== 'admin') {
      set.status = 403
      return { message: 'Akses ditolak' }
    }

    await db.delete(dokumentasiLaporan).where(eq(dokumentasiLaporan.idDokumentasi, params.idDok))
    return { message: 'Dokumentasi berhasil dihapus' }
  })

  // DELETE /laporan/:id — hapus laporan (admin only)
  .delete('/:id', async (ctx) => {
    const { params, set } = ctx
    const u = (ctx as unknown as { user: UserPayload }).user

    if (u.namaRole !== 'admin') {
      set.status = 403
      return { message: 'Akses ditolak' }
    }

    const [existing] = await db
      .select({ idLaporan: laporanKegiatan.idLaporan })
      .from(laporanKegiatan)
      .where(eq(laporanKegiatan.idLaporan, params.id))
      .limit(1)

    if (!existing) { set.status = 404; return { message: 'Laporan tidak ditemukan' } }

    await db.delete(laporanKegiatan).where(eq(laporanKegiatan.idLaporan, params.id))
    const ip3 = ctx.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? undefined
    await catatLog({ idUser: u.idUser, aksi: 'HAPUS_LAPORAN', keterangan: `Laporan ${params.id} dihapus`, ipAddress: ip3 }).catch(() => {})
    return { message: 'Laporan berhasil dihapus' }
  })
