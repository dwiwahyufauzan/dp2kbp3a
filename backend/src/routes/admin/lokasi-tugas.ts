import { Elysia, t } from 'elysia'
import { eq, like, or, and } from 'drizzle-orm'
import { db } from '../../db/connection'
import { lokasiTugas } from '../../db/schema'
import { authPlugin } from '../../plugins/auth'
import type { UserPayload } from '../../types'

// SRS: Tabel lokasi_tugas — master wilayah tugas operasional (endpoint: /admin/lokasi-tugas)
export const adminLokasiTugasRoutes = new Elysia({ prefix: '/admin/lokasi-tugas' })
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

  // GET /admin/lokasi-tugas — daftar semua lokasi (bisa filter ?kecamatan=xxx)
  .get(
    '/',
    async ({ query }) => {
      if (query.kecamatan) {
        return db
          .select()
          .from(lokasiTugas)
          .where(like(lokasiTugas.namaKecamatan, `%${query.kecamatan}%`))
          .orderBy(lokasiTugas.namaKecamatan, lokasiTugas.namaDesa)
      }
      return db.select().from(lokasiTugas).orderBy(lokasiTugas.namaKecamatan, lokasiTugas.namaDesa)
    },
    {
      query: t.Object({
        kecamatan: t.Optional(t.String()),
      }),
    }
  )

  // GET /admin/lokasi-tugas/:id
  .get('/:id', async ({ params, set }) => {
    const [row] = await db
      .select()
      .from(lokasiTugas)
      .where(eq(lokasiTugas.idLokasi, params.id))
      .limit(1)

    if (!row) {
      set.status = 404
      return { message: 'Lokasi tidak ditemukan' }
    }
    return row
  })

  // POST /admin/lokasi-tugas — tambah lokasi baru
  .post(
    '/',
    async ({ body, set }) => {
      const [existing] = await db
        .select({ idLokasi: lokasiTugas.idLokasi })
        .from(lokasiTugas)
        .where(
          or(
            eq(lokasiTugas.namaDesa, body.namaDesa.trim()),
            eq(lokasiTugas.namaKecamatan, body.namaKecamatan.trim())
          )
        )
        .limit(1)

      // Cek kombinasi kecamatan + desa agar tidak duplikat
      const [dupCheck] = await db
        .select({ idLokasi: lokasiTugas.idLokasi })
        .from(lokasiTugas)
        .where(
          and(
            eq(lokasiTugas.namaKecamatan, body.namaKecamatan.trim()),
            eq(lokasiTugas.namaDesa, body.namaDesa.trim())
          )
        )
        .limit(1)

      void existing // used above for context
      if (dupCheck) {
        set.status = 409
        return { message: 'Desa/kelurahan dengan nama tersebut sudah ada' }
      }

      const idLokasi = crypto.randomUUID()
      await db.insert(lokasiTugas).values({
        idLokasi,
        namaKecamatan: body.namaKecamatan.trim(),
        namaDesa: body.namaDesa.trim(),
      })

      return { idLokasi, message: 'Lokasi tugas berhasil ditambahkan' }
    },
    {
      body: t.Object({
        namaKecamatan: t.String({ minLength: 2, maxLength: 100 }),
        namaDesa: t.String({ minLength: 2, maxLength: 100 }),
      }),
    }
  )

  // PATCH /admin/lokasi-tugas/:id — update lokasi
  .patch(
    '/:id',
    async ({ params, body, set }) => {
      const [existing] = await db
        .select()
        .from(lokasiTugas)
        .where(eq(lokasiTugas.idLokasi, params.id))
        .limit(1)

      if (!existing) {
        set.status = 404
        return { message: 'Lokasi tidak ditemukan' }
      }

      await db
        .update(lokasiTugas)
        .set({
          namaKecamatan: body.namaKecamatan ? body.namaKecamatan.trim() : existing.namaKecamatan,
          namaDesa: body.namaDesa ? body.namaDesa.trim() : existing.namaDesa,
        })
        .where(eq(lokasiTugas.idLokasi, params.id))

      return { message: 'Lokasi tugas berhasil diperbarui' }
    },
    {
      body: t.Object({
        namaKecamatan: t.Optional(t.String({ minLength: 2, maxLength: 100 })),
        namaDesa: t.Optional(t.String({ minLength: 2, maxLength: 100 })),
      }),
    }
  )

  // DELETE /admin/lokasi-tugas/:id — hapus lokasi
  .delete('/:id', async ({ params, set }) => {
    const [existing] = await db
      .select({ idLokasi: lokasiTugas.idLokasi })
      .from(lokasiTugas)
      .where(eq(lokasiTugas.idLokasi, params.id))
      .limit(1)

    if (!existing) {
      set.status = 404
      return { message: 'Lokasi tidak ditemukan' }
    }

    try {
      await db.delete(lokasiTugas).where(eq(lokasiTugas.idLokasi, params.id))
      return { message: 'Lokasi tugas berhasil dihapus' }
    } catch (e: unknown) {
      if ((e as { code?: string })?.code === 'ER_ROW_IS_REFERENCED_2') {
        set.status = 409
        return { message: 'Lokasi tidak dapat dihapus karena masih digunakan petugas' }
      }
      throw e
    }
  })
