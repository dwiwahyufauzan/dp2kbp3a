import { Elysia, t } from 'elysia'
import { eq } from 'drizzle-orm'
import { db } from '../db/connection'
import { users, roles, bidang, lokasiTugas } from '../db/schema'
import { authPlugin } from '../plugins/auth'
import type { UserPayload } from '../types'

export const profilRoutes = new Elysia({ prefix: '/profil' })
  .use(authPlugin)
  .onBeforeHandle((ctx) => {
    const user = (ctx as unknown as { user: UserPayload | null }).user
    if (!user) {
      ctx.set.status = 401
      return { message: 'Tidak terautentikasi' }
    }
  })

  // GET /profil — data profil saya sendiri
  .get('/', async (ctx) => {
    const u = (ctx as unknown as { user: UserPayload }).user
    const [row] = await db
      .select({
        idUser: users.idUser,
        namaLengkap: users.namaLengkap,
        email: users.email,
        namaRole: roles.namaRole,
        permissions: roles.permissions,
        namaBidang: bidang.namaBidang,
        namaKecamatan: lokasiTugas.namaKecamatan,
        namaDesa: lokasiTugas.namaDesa,
        statusAktif: users.statusAktif,
        createdAt: users.createdAt,
      })
      .from(users)
      .leftJoin(roles, eq(users.idRole, roles.idRole))
      .leftJoin(bidang, eq(users.idBidang, bidang.idBidang))
      .leftJoin(lokasiTugas, eq(users.idLokasi, lokasiTugas.idLokasi))
      .where(eq(users.idUser, u.idUser))
      .limit(1)

    if (!row) {
      ctx.set.status = 404
      return { message: 'User tidak ditemukan' }
    }

    let parsedPerms = row.permissions;
    if (typeof parsedPerms === 'string') {
      try {
        parsedPerms = JSON.parse(parsedPerms);
      } catch {
        parsedPerms = [];
      }
    }
    return {
      ...row,
      permissions: parsedPerms || [],
    }
  })

  // PATCH /profil — update nama, email, password sendiri
  .patch(
    '/',
    async (ctx) => {
      const u = (ctx as unknown as { user: UserPayload }).user
      const { body, set } = ctx

      const updateData: Record<string, string> = {}

      if (body.namaLengkap?.trim()) {
        updateData.namaLengkap = body.namaLengkap.trim()
      }

      if (body.email?.trim()) {
        // Cek apakah email sudah dipakai user lain
        const [existing] = await db
          .select({ idUser: users.idUser })
          .from(users)
          .where(eq(users.email, body.email.trim().toLowerCase()))
          .limit(1)
        if (existing && existing.idUser !== u.idUser) {
          set.status = 409
          return { message: 'Email sudah digunakan oleh akun lain' }
        }
        updateData.email = body.email.trim().toLowerCase()
      }

      if (body.password?.trim()) {
        if (body.password.length < 8) {
          set.status = 400
          return { message: 'Password minimal 8 karakter' }
        }
        const hashed = await Bun.password.hash(body.password, { algorithm: 'bcrypt', cost: 10 })
        updateData.password = hashed
      }

      if (Object.keys(updateData).length === 0) {
        set.status = 400
        return { message: 'Tidak ada data yang diubah' }
      }

      await db.update(users).set(updateData).where(eq(users.idUser, u.idUser))
      return { message: 'Profil berhasil diperbarui' }
    },
    {
      body: t.Object({
        namaLengkap: t.Optional(t.String({ minLength: 2, maxLength: 100 })),
        email: t.Optional(t.String({ format: 'email' })),
        password: t.Optional(t.String()),
      }),
    }
  )
