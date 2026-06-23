import { Elysia, t } from 'elysia'
import { eq } from 'drizzle-orm'
import { db } from '../../db/connection'
import { roles } from '../../db/schema'
import { authPlugin } from '../../plugins/auth'
import type { UserPayload } from '../../types'

export const adminHakAksesRoutes = new Elysia({ prefix: '/admin/hak-akses' })
  .use(authPlugin)
  .onBeforeHandle((ctx) => {
    const user = (ctx as unknown as { user: UserPayload | null }).user
    if (!user) {
      ctx.set.status = 401
      return { message: 'Tidak terautentikasi' }
    }
    if (user.namaRole !== 'admin') {
      ctx.set.status = 403
      return { message: 'Hanya admin yang dapat mengakses' }
    }
  })

  // GET /admin/hak-akses — daftar semua role dan permissions
  .get('/', async () => {
    return db.select().from(roles).orderBy(roles.namaRole)
  })

  // PATCH /admin/hak-akses/:id — update permissions untuk sebuah role
  .patch(
    '/:id',
    async ({ params, body, set }) => {
      const [existing] = await db
        .select()
        .from(roles)
        .where(eq(roles.idRole, params.id))
        .limit(1)

      if (!existing) {
        set.status = 404
        return { message: 'Role tidak ditemukan' }
      }

      if (existing.namaRole === 'admin') {
        set.status = 400
        return { message: 'Hak akses Administrator tidak dapat diubah' }
      }

      await db
        .update(roles)
        .set({
          permissions: body.permissions,
        })
        .where(eq(roles.idRole, params.id))

      return { message: `Hak akses untuk role ${existing.namaRole} berhasil diperbarui` }
    },
    {
      body: t.Object({
        permissions: t.Array(t.String()),
      }),
    }
  )
