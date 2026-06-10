import { Elysia, t } from 'elysia'
import { eq } from 'drizzle-orm'
import { db } from '../../db/connection'
import { users, roles, bidang, lokasiTugas } from '../../db/schema'
import { authPlugin } from '../../plugins/auth'
import type { UserPayload } from '../../types'

export const adminPenggunaRoutes = new Elysia({ prefix: '/admin/pengguna' })
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

  // GET /admin/pengguna — daftar semua pengguna (SRS F-10)
  .get('/', async () => {
    return db
      .select({
        idUser: users.idUser,
        namaLengkap: users.namaLengkap,
        email: users.email,
        namaRole: roles.namaRole,
        idRole: users.idRole,
        idBidang: users.idBidang,
        namaBidang: bidang.namaBidang,
        idLokasi: users.idLokasi,
        namaKecamatan: lokasiTugas.namaKecamatan,
        namaDesa: lokasiTugas.namaDesa,
        statusAktif: users.statusAktif,
        createdAt: users.createdAt,
      })
      .from(users)
      .leftJoin(roles, eq(users.idRole, roles.idRole))
      .leftJoin(bidang, eq(users.idBidang, bidang.idBidang))
      .leftJoin(lokasiTugas, eq(users.idLokasi, lokasiTugas.idLokasi))
      .orderBy(users.namaLengkap)
  })

  // GET /admin/pengguna/:id
  .get('/:id', async ({ params, set }) => {
    const [user] = await db
      .select({
        idUser: users.idUser,
        namaLengkap: users.namaLengkap,
        email: users.email,
        namaRole: roles.namaRole,
        idRole: users.idRole,
        idBidang: users.idBidang,
        namaBidang: bidang.namaBidang,
        idLokasi: users.idLokasi,
        namaKecamatan: lokasiTugas.namaKecamatan,
        namaDesa: lokasiTugas.namaDesa,
        statusAktif: users.statusAktif,
        createdAt: users.createdAt,
      })
      .from(users)
      .leftJoin(roles, eq(users.idRole, roles.idRole))
      .leftJoin(bidang, eq(users.idBidang, bidang.idBidang))
      .leftJoin(lokasiTugas, eq(users.idLokasi, lokasiTugas.idLokasi))
      .where(eq(users.idUser, params.id))
      .limit(1)

    if (!user) {
      set.status = 404
      return { message: 'Pengguna tidak ditemukan' }
    }
    return user
  })

  // GET /admin/pengguna/roles — daftar semua role
  .get('/roles', async () => {
    return db.select().from(roles).orderBy(roles.namaRole)
  })

  // POST /admin/pengguna — tambah pengguna baru (SRS F-10)
  .post(
    '/',
    async ({ body, set }) => {
      const [existing] = await db
        .select({ idUser: users.idUser })
        .from(users)
        .where(eq(users.email, body.email.toLowerCase().trim()))
        .limit(1)

      if (existing) {
        set.status = 409
        return { message: 'Email sudah terdaftar' }
      }

      // Validasi idRole
      const [role] = await db
        .select({ idRole: roles.idRole })
        .from(roles)
        .where(eq(roles.idRole, body.idRole))
        .limit(1)

      if (!role) {
        set.status = 400
        return { message: 'Role tidak ditemukan' }
      }

      const password = await Bun.password.hash(body.password)
      const idUser = crypto.randomUUID()

      await db.insert(users).values({
        idUser,
        namaLengkap: body.namaLengkap.trim(),
        email: body.email.toLowerCase().trim(),
        password,
        idRole: body.idRole,
        idBidang: body.idBidang ?? null,
        idLokasi: body.idLokasi ?? null,
        statusAktif: 'y',
      })

      return { idUser, message: 'Pengguna berhasil ditambahkan' }
    },
    {
      body: t.Object({
        namaLengkap: t.String({ minLength: 2, maxLength: 100 }),
        email: t.String({ minLength: 5, maxLength: 150 }),
        password: t.String({ minLength: 8, maxLength: 100 }),
        idRole: t.String({ minLength: 1 }),
        idBidang: t.Optional(t.Nullable(t.String())),
        idLokasi: t.Optional(t.Nullable(t.String())),
      }),
    }
  )

  // PATCH /admin/pengguna/:id — update pengguna (SRS F-10)
  .patch(
    '/:id',
    async ({ params, body, set }) => {
      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.idUser, params.id))
        .limit(1)

      if (!existing) {
        set.status = 404
        return { message: 'Pengguna tidak ditemukan' }
      }

      type UsersUpdate = {
        namaLengkap?: string
        email?: string
        idRole?: string
        idBidang?: string | null
        idLokasi?: string | null
        statusAktif?: 'y' | 'n'
        password?: string
      }

      const updateData: UsersUpdate = {}

      if (body.namaLengkap) updateData.namaLengkap = body.namaLengkap.trim()
      if (body.idRole) updateData.idRole = body.idRole
      if (body.idBidang !== undefined) updateData.idBidang = body.idBidang
      if (body.idLokasi !== undefined) updateData.idLokasi = body.idLokasi
      if (body.statusAktif !== undefined) updateData.statusAktif = body.statusAktif

      if (body.password) {
        updateData.password = await Bun.password.hash(body.password)
      }

      if (body.email && body.email !== existing.email) {
        const [emailExist] = await db
          .select({ idUser: users.idUser })
          .from(users)
          .where(eq(users.email, body.email.toLowerCase().trim()))
          .limit(1)
        if (emailExist) {
          set.status = 409
          return { message: 'Email sudah dipakai pengguna lain' }
        }
        updateData.email = body.email.toLowerCase().trim()
      }

      await db.update(users).set(updateData).where(eq(users.idUser, params.id))
      return { message: 'Pengguna berhasil diperbarui' }
    },
    {
      body: t.Object({
        namaLengkap: t.Optional(t.String({ minLength: 2, maxLength: 100 })),
        email: t.Optional(t.String({ minLength: 5, maxLength: 150 })),
        password: t.Optional(t.String({ minLength: 8, maxLength: 100 })),
        idRole: t.Optional(t.String()),
        idBidang: t.Optional(t.Nullable(t.String())),
        idLokasi: t.Optional(t.Nullable(t.String())),
        statusAktif: t.Optional(t.Union([t.Literal('y'), t.Literal('n')])),
      }),
    }
  )

  // DELETE /admin/pengguna/:id — hapus pengguna (SRS F-10)
  .delete('/:id', async (ctx) => {
    const { params, set } = ctx
    const u = (ctx as unknown as { user: UserPayload }).user

    if (params.id === u.idUser) {
      set.status = 400
      return { message: 'Tidak dapat menghapus akun sendiri' }
    }

    const [existing] = await db
      .select({ idUser: users.idUser })
      .from(users)
      .where(eq(users.idUser, params.id))
      .limit(1)

    if (!existing) {
      set.status = 404
      return { message: 'Pengguna tidak ditemukan' }
    }

    await db.delete(users).where(eq(users.idUser, params.id))
    return { message: 'Pengguna berhasil dihapus' }
  })
