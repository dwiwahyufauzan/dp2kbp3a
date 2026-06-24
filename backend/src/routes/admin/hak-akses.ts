import { Elysia, t } from 'elysia'
import { eq } from 'drizzle-orm'
import { db } from '../../db/connection'
import { roles } from '../../db/schema'
import { authPlugin } from '../../plugins/auth'
import type { UserPayload } from '../../types'
import { hasPermission } from '../../utils/permission'

export const adminHakAksesRoutes = new Elysia({ prefix: '/admin/hak-akses' })
  .use(authPlugin)
  .onBeforeHandle(async (ctx) => {
    const user = (ctx as unknown as { user: UserPayload | null }).user
    if (!user) {
      ctx.set.status = 401
      return { message: 'Tidak terautentikasi' }
    }
    const allowed = await hasPermission(user.namaRole, 'kelola_hak_akses')
    if (!allowed) {
      ctx.set.status = 403
      return { message: 'Akses ditolak: Anda tidak memiliki izin kelola_hak_akses' }
    }
  })

  // GET /admin/hak-akses — daftar semua role dan permissions
  .get('/', async () => {
    const list = await db.select().from(roles).orderBy(roles.namaRole)
    return list.map(r => {
      let perms = r.permissions;
      if (typeof perms === 'string') {
        try { perms = JSON.parse(perms) } catch { perms = [] }
      }
      return { ...r, permissions: perms || [] }
    })
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
