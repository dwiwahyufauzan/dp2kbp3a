import { Elysia } from 'elysia'
import { eq, and, desc } from 'drizzle-orm'
import { db } from '../db/connection'
import { notifikasi } from '../db/schema'
import { authPlugin } from '../plugins/auth'
import type { UserPayload } from '../types'

export const notifikasiRoutes = new Elysia({ prefix: '/notifikasi' })
  .use(authPlugin)
  .onBeforeHandle((ctx) => {
    const u = (ctx as unknown as { user: UserPayload | null }).user
    if (!u) {
      ctx.set.status = 401
      return { message: 'Tidak terautentikasi' }
    }
  })

  // GET /notifikasi — daftar notifikasi saya (terbaru 30)
  .get('/', async (ctx) => {
    const u = (ctx as unknown as { user: UserPayload }).user
    const rows = await db
      .select()
      .from(notifikasi)
      .where(eq(notifikasi.idUserPenerima, u.idUser))
      .orderBy(desc(notifikasi.createdAt))
      .limit(30)

    const unread = rows.filter((r) => r.isRead === 0).length
    return { list: rows, unread }
  })

  // PATCH /notifikasi/:id/read — tandai satu notif sudah dibaca
  .patch('/:id/read', async (ctx) => {
    const u = (ctx as unknown as { user: UserPayload }).user
    await db
      .update(notifikasi)
      .set({ isRead: 1 })
      .where(and(eq(notifikasi.idNotif, ctx.params.id), eq(notifikasi.idUserPenerima, u.idUser)))
    return { message: 'Ditandai sudah dibaca' }
  })

  // PATCH /notifikasi/read-all — tandai semua sudah dibaca
  .patch('/read-all', async (ctx) => {
    const u = (ctx as unknown as { user: UserPayload }).user
    await db
      .update(notifikasi)
      .set({ isRead: 1 })
      .where(and(eq(notifikasi.idUserPenerima, u.idUser), eq(notifikasi.isRead, 0)))
    return { message: 'Semua notifikasi telah ditandai dibaca' }
  })
