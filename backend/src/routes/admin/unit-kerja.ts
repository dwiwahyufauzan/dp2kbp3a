import { Elysia, t } from 'elysia'
import { eq } from 'drizzle-orm'
import { db } from '../../db/connection'
import { bidang } from '../../db/schema'
import { authPlugin } from '../../plugins/auth'
import type { UserPayload } from '../../types'
import { hasPermission } from '../../utils/permission'

// SRS F-11: Manajemen bidang/unit kerja (endpoint: /admin/bidang)
export const adminUnitKerjaRoutes = new Elysia({ prefix: '/admin/bidang' })
  .use(authPlugin)
  .onBeforeHandle(async (ctx) => {
    const user = (ctx as unknown as { user: UserPayload | null }).user
    if (!user) {
      ctx.set.status = 401
      return { message: 'Tidak terautentikasi' }
    }
    // Pengguna dengan izin kelola_master yang dapat mengubah (POST, PATCH, DELETE) data bidang
    if (['POST', 'PATCH', 'DELETE'].includes(ctx.request.method)) {
      const canManage = await hasPermission(user.namaRole, 'kelola_master')
      if (!canManage) {
        ctx.set.status = 403
        return { message: 'Akses ditolak: Anda tidak memiliki izin kelola_master' }
      }
    }
  })

  // GET /admin/bidang — daftar semua bidang
  .get('/', async () => {
    return db.select().from(bidang).orderBy(bidang.namaBidang)
  })

  // GET /admin/bidang/:id
  .get('/:id', async ({ params, set }) => {
    const [row] = await db
      .select()
      .from(bidang)
      .where(eq(bidang.idBidang, params.id))
      .limit(1)

    if (!row) {
      set.status = 404
      return { message: 'Bidang tidak ditemukan' }
    }
    return row
  })

  // POST /admin/bidang — tambah bidang baru
  .post(
    '/',
    async ({ body, set }) => {
      const [existing] = await db
        .select({ idBidang: bidang.idBidang })
        .from(bidang)
        .where(eq(bidang.namaBidang, body.namaBidang.trim()))
        .limit(1)

      if (existing) {
        set.status = 409
        return { message: 'Nama bidang sudah digunakan' }
      }

      const idBidang = crypto.randomUUID()
      await db.insert(bidang).values({
        idBidang,
        namaBidang: body.namaBidang.trim(),
        deskripsi: body.deskripsi?.trim(),
      })

      return { idBidang, message: 'Bidang berhasil ditambahkan' }
    },
    {
      body: t.Object({
        namaBidang: t.String({ minLength: 2, maxLength: 100 }),
        deskripsi: t.Optional(t.String({ maxLength: 500 })),
      }),
    }
  )

  // PATCH /admin/bidang/:id — update bidang
  .patch(
    '/:id',
    async ({ params, body, set }) => {
      const [existing] = await db
        .select()
        .from(bidang)
        .where(eq(bidang.idBidang, params.id))
        .limit(1)

      if (!existing) {
        set.status = 404
        return { message: 'Bidang tidak ditemukan' }
      }

      await db
        .update(bidang)
        .set({
          namaBidang: body.namaBidang ? body.namaBidang.trim() : existing.namaBidang,
          deskripsi:
            body.deskripsi !== undefined ? body.deskripsi?.trim() : existing.deskripsi,
        })
        .where(eq(bidang.idBidang, params.id))

      return { message: 'Bidang berhasil diperbarui' }
    },
    {
      body: t.Object({
        namaBidang: t.Optional(t.String({ minLength: 2, maxLength: 100 })),
        deskripsi: t.Optional(t.Nullable(t.String({ maxLength: 500 }))),
      }),
    }
  )

  // DELETE /admin/bidang/:id — hapus bidang
  .delete('/:id', async ({ params, set }) => {
    const [existing] = await db
      .select({ idBidang: bidang.idBidang })
      .from(bidang)
      .where(eq(bidang.idBidang, params.id))
      .limit(1)

    if (!existing) {
      set.status = 404
      return { message: 'Bidang tidak ditemukan' }
    }

    try {
      await db.delete(bidang).where(eq(bidang.idBidang, params.id))
      return { message: 'Bidang berhasil dihapus' }
    } catch (e: unknown) {
      if ((e as { code?: string })?.code === 'ER_ROW_IS_REFERENCED_2') {
        set.status = 409
        return { message: 'Bidang tidak dapat dihapus karena masih memiliki pengguna' }
      }
      throw e
    }
  })
