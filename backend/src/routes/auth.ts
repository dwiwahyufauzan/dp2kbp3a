import { Elysia, t } from 'elysia'
import { eq } from 'drizzle-orm'
import { db } from '../db/connection'
import { users, roles } from '../db/schema'
import { jwtPlugin } from '../plugins/jwt'
import { catatLog } from './log-aktivitas'
import { checkRateLimit, getClientIP } from '../plugins/rateLimit'
import type { UserPayload } from '../types'

export const authRoutes = new Elysia({ prefix: '/auth' })
  .use(jwtPlugin)

  // POST /auth/login
  .post(
    '/login',
    async ({ jwt, body, cookie, set, request }) => {
      // Rate limiting: 5 percobaan per IP per menit
      const ip = getClientIP(request)
      const rl = checkRateLimit(ip)
      if (!rl.allowed) {
        set.status = 429
        return { message: `Terlalu banyak percobaan login. Coba lagi dalam ${rl.retryAfterSec} detik.` }
      }

      const [user] = await db
        .select({
          idUser: users.idUser,
          namaLengkap: users.namaLengkap,
          email: users.email,
          password: users.password,
          statusAktif: users.statusAktif,
          idRole: users.idRole,
          namaRole: roles.namaRole,
          idBidang: users.idBidang,
          idLokasi: users.idLokasi,
        })
        .from(users)
        .leftJoin(roles, eq(users.idRole, roles.idRole))
        .where(eq(users.email, body.email.toLowerCase().trim()))
        .limit(1)

      if (!user || !user.namaRole) {
        set.status = 401
        return { message: 'Email atau password salah' }
      }
      if (user.statusAktif !== 'y') {
        set.status = 403
        return { message: 'Akun tidak aktif' }
      }

      const valid = await Bun.password.verify(body.password, user.password)
      if (!valid) {
        set.status = 401
        return { message: 'Email atau password salah' }
      }

      const payload: UserPayload = {
        idUser: user.idUser,
        namaLengkap: user.namaLengkap,
        email: user.email,
        namaRole: user.namaRole,
        idBidang: user.idBidang,
        idLokasi: user.idLokasi,
      }

      const token = await jwt.sign(payload as unknown as Record<string, string>)

      cookie['session']!.set({
        value: token,
        httpOnly: true,
        maxAge: 8 * 3600,
        path: '/',
        sameSite: 'lax',
        secure: Bun.env.NODE_ENV === 'production',
      })

      await catatLog({ idUser: user.idUser, aksi: 'LOGIN', keterangan: `Login berhasil: ${user.email}`, ipAddress: ip }).catch(() => {})

      return { message: 'Login berhasil', user: payload }
    },
    {
      body: t.Object({
        email: t.String({ minLength: 1 }),
        password: t.String({ minLength: 1 }),
      }),
    }
  )

  // POST /auth/logout
  .post('/logout', async (ctx) => {
    const { cookie, request } = ctx
    const rawToken = cookie['session']?.value
    // Coba dapatkan idUser dari token sebelum dihapus
    try {
      if (typeof rawToken === 'string' && rawToken) {
        const { jwt } = ctx as unknown as { jwt: { verify: (t: string) => Promise<UserPayload | null> } }
        const payload = await jwt.verify(rawToken)
        if (payload) {
          const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip') ?? undefined
          await catatLog({ idUser: (payload as UserPayload).idUser, aksi: 'LOGOUT', keterangan: 'Pengguna logout', ipAddress: ip }).catch(() => {})
        }
      }
    } catch { /* abaikan */ }
    cookie['session']!.remove()
    return { message: 'Logout berhasil' }
  })

  // GET /auth/me
  .get('/me', async ({ jwt, cookie, set }) => {
    const rawToken = cookie['session']?.value
    const token = typeof rawToken === 'string' ? rawToken : ''
    if (!token) {
      set.status = 401
      return { message: 'Tidak terautentikasi' }
    }

    try {
      const payload = await jwt.verify(token)
      if (!payload) {
        set.status = 401
        return { message: 'Token tidak valid atau kedaluwarsa' }
      }
      return { user: payload }
    } catch {
      set.status = 401
      return { message: 'Token tidak valid atau kedaluwarsa' }
    }
  })
