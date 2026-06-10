import { Elysia, t } from 'elysia'
import { eq, and } from 'drizzle-orm'
import { db } from '../db/connection'
import { jenisKegiatan, bidang } from '../db/schema'
import { authPlugin } from '../plugins/auth'
import type { UserPayload } from '../types'

// SRS: Jenis Kegiatan — dikelola oleh Admin & Pimpinan (endpoint: /jenis-kegiatan)
export const masterKegiatanRoutes = new Elysia({ prefix: '/jenis-kegiatan' })
  .use(authPlugin)

  // GET /jenis-kegiatan — daftar semua jenis kegiatan, opsional filter ?idBidang=xxx
  .get('/', async (ctx) => {
    const user = (ctx as unknown as { user: UserPayload | null }).user
    if (!user) {
      ctx.set.status = 401
      return { message: 'Tidak terautentikasi' }
    }
    const query = (ctx as unknown as { query: Record<string, string> }).query
    const idBidang = query?.idBidang ?? ''

    const conditions = []
    if (idBidang) {
      conditions.push(eq(jenisKegiatan.idBidang, idBidang))
    }
    const where = conditions.length > 0 ? and(...conditions) : undefined

    return db
      .select({
        idJenis: jenisKegiatan.idJenis,
        idBidang: jenisKegiatan.idBidang,
        namaKegiatan: jenisKegiatan.namaKegiatan,
        namaBidang: bidang.namaBidang,
      })
      .from(jenisKegiatan)
      .leftJoin(bidang, eq(jenisKegiatan.idBidang, bidang.idBidang))
      .where(where)
      .orderBy(jenisKegiatan.namaKegiatan)
  })

  // GET /jenis-kegiatan/:id
  .get('/:id', async (ctx) => {
    const { params } = ctx
    const user = (ctx as unknown as { user: UserPayload | null }).user
    if (!user) {
      ctx.set.status = 401
      return { message: 'Tidak terautentikasi' }
    }

    const [row] = await db
      .select()
      .from(jenisKegiatan)
      .where(eq(jenisKegiatan.idJenis, params.id))
      .limit(1)

    if (!row) {
      ctx.set.status = 404
      return { message: 'Jenis kegiatan tidak ditemukan' }
    }
    return row
  })

  // POST /jenis-kegiatan — tambah jenis kegiatan (Admin & Pimpinan)
  .post(
    '/',
    async (ctx) => {
      const { body } = ctx
      const user = (ctx as unknown as { user: UserPayload | null }).user
      if (!user) {
        ctx.set.status = 401
        return { message: 'Tidak terautentikasi' }
      }
      if (!['admin', 'pimpinan'].includes(user.namaRole)) {
        ctx.set.status = 403
        return { message: 'Hanya admin atau pimpinan yang dapat mengelola jenis kegiatan' }
      }

      const idJenis = crypto.randomUUID()
      await db.insert(jenisKegiatan).values({
        idJenis,
        idBidang: body.idBidang ?? null,
        namaKegiatan: body.namaKegiatan.trim(),
      })

      return { idJenis, message: 'Jenis kegiatan berhasil ditambahkan' }
    },
    {
      body: t.Object({
        namaKegiatan: t.String({ minLength: 3, maxLength: 100 }),
        idBidang: t.Optional(t.Nullable(t.String())),
      }),
    }
  )

  // PATCH /jenis-kegiatan/:id — ubah nama kegiatan (Admin & Pimpinan)
  .patch(
    '/:id',
    async (ctx) => {
      const { params, body } = ctx
      const user = (ctx as unknown as { user: UserPayload | null }).user
      if (!user) {
        ctx.set.status = 401
        return { message: 'Tidak terautentikasi' }
      }
      if (!['admin', 'pimpinan'].includes(user.namaRole)) {
        ctx.set.status = 403
        return { message: 'Akses ditolak' }
      }

      const [existing] = await db
        .select()
        .from(jenisKegiatan)
        .where(eq(jenisKegiatan.idJenis, params.id))
        .limit(1)

      if (!existing) {
        ctx.set.status = 404
        return { message: 'Jenis kegiatan tidak ditemukan' }
      }

      await db
        .update(jenisKegiatan)
        .set({
          namaKegiatan: body.namaKegiatan ? body.namaKegiatan.trim() : existing.namaKegiatan,
          idBidang: body.idBidang !== undefined ? body.idBidang : existing.idBidang,
        })
        .where(eq(jenisKegiatan.idJenis, params.id))

      return { message: 'Jenis kegiatan berhasil diperbarui' }
    },
    {
      body: t.Object({
        namaKegiatan: t.Optional(t.String({ minLength: 3, maxLength: 100 })),
        idBidang: t.Optional(t.Nullable(t.String())),
      }),
    }
  )

  // DELETE /jenis-kegiatan/:id — hapus kegiatan (Admin & Pimpinan)
  .delete('/:id', async (ctx) => {
    const { params } = ctx
    const user = (ctx as unknown as { user: UserPayload | null }).user
    if (!user) {
      ctx.set.status = 401
      return { message: 'Tidak terautentikasi' }
    }
    if (!['admin', 'pimpinan'].includes(user.namaRole)) {
      ctx.set.status = 403
      return { message: 'Akses ditolak' }
    }

    const [existing] = await db
      .select({ idJenis: jenisKegiatan.idJenis })
      .from(jenisKegiatan)
      .where(eq(jenisKegiatan.idJenis, params.id))
      .limit(1)

    if (!existing) {
      ctx.set.status = 404
      return { message: 'Jenis kegiatan tidak ditemukan' }
    }

    try {
      await db.delete(jenisKegiatan).where(eq(jenisKegiatan.idJenis, params.id))
      return { message: 'Jenis kegiatan berhasil dihapus' }
    } catch (e: unknown) {
      if ((e as { code?: string })?.code === 'ER_ROW_IS_REFERENCED_2') {
        ctx.set.status = 409
        return { message: 'Jenis kegiatan tidak dapat dihapus karena sudah digunakan di laporan' }
      }
      throw e
    }
  })
