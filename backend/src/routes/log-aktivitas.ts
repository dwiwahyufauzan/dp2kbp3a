import { Elysia, t } from 'elysia'
import { desc, eq, sql } from 'drizzle-orm'
import { db } from '../db/connection'
import { logAktivitas, users } from '../db/schema'
import { authPlugin } from '../plugins/auth'
import type { UserPayload } from '../types'

// SRS F-12: Log aktivitas sistem — hanya admin & pimpinan yang dapat melihat
export const logAktivitasRoutes = new Elysia({ prefix: '/log-aktivitas' })
  .use(authPlugin)
  .onBeforeHandle((ctx) => {
    const user = (ctx as unknown as { user: UserPayload | null }).user
    if (!user) {
      ctx.set.status = 401
      return { message: 'Tidak terautentikasi' }
    }
    if (!['admin', 'pimpinan'].includes(user.namaRole)) {
      ctx.set.status = 403
      return { message: 'Akses ditolak' }
    }
  })

  // GET /log-aktivitas?idUser=xxx&limit=50
  .get(
    '/',
    async ({ query }) => {
      const limit = Math.min(Number(query.limit ?? 100), 500)

      if (query.idUser) {
        return db
          .select({
            idLog: logAktivitas.idLog,
            idUser: logAktivitas.idUser,
            namaLengkap: users.namaLengkap,
            aksi: logAktivitas.aksi,
            keterangan: logAktivitas.keterangan,
            ipAddress: logAktivitas.ipAddress,
            createdAt: logAktivitas.createdAt,
          })
          .from(logAktivitas)
          .leftJoin(users, eq(logAktivitas.idUser, users.idUser))
          .where(eq(logAktivitas.idUser, query.idUser))
          .orderBy(desc(logAktivitas.createdAt))
          .limit(limit)
      }

      return db
        .select({
          idLog: logAktivitas.idLog,
          idUser: logAktivitas.idUser,
          namaLengkap: users.namaLengkap,
          aksi: logAktivitas.aksi,
          keterangan: logAktivitas.keterangan,
          ipAddress: logAktivitas.ipAddress,
          createdAt: logAktivitas.createdAt,
        })
        .from(logAktivitas)
        .leftJoin(users, eq(logAktivitas.idUser, users.idUser))
        .orderBy(desc(logAktivitas.createdAt))
        .limit(limit)
    },
    {
      query: t.Object({
        idUser: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
    }
  )

// ─── Helper: Catat log aktivitas dari route lain ───────────────────────────
export async function catatLog(params: {
  idUser: string | null
  aksi: string
  keterangan?: string
  ipAddress?: string
}) {
  await db.insert(logAktivitas).values({
    idLog: crypto.randomUUID(),
    idUser: params.idUser,
    aksi: params.aksi,
    keterangan: params.keterangan,
    ipAddress: params.ipAddress,
  })
}
