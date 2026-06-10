import type { Handle } from '@sveltejs/kit'
import { jwtVerify, type JWTPayload } from 'jose'

// Verifikasi JWT lokal — tidak perlu round-trip HTTP ke backend setiap request
// process.env tersedia di SvelteKit SSR runtime (Node/Bun)
const JWT_SECRET = new TextEncoder().encode(
	process.env.JWT_SECRET ?? 'dp2kbp3a-super-secret-key-ganti-sebelum-deploy-2026'
)

interface UserClaims extends JWTPayload {
	idUser: string
	namaLengkap: string
	email: string
	namaRole: string
	idBidang: string | null
	idLokasi: string | null
}

export const handle: Handle = async ({ event, resolve }) => {
	const sessionCookie = event.cookies.get('session')

	if (sessionCookie) {
		try {
			const { payload } = await jwtVerify<UserClaims>(sessionCookie, JWT_SECRET)
			event.locals.user = {
				idUser: payload.idUser,
				namaLengkap: payload.namaLengkap,
				email: payload.email,
				namaRole: payload.namaRole,
				idBidang: payload.idBidang,
				idLokasi: payload.idLokasi,
			}
		} catch {
			// Token kadaluarsa atau tidak valid — hapus cookie
			event.cookies.delete('session', { path: '/' })
			event.locals.user = null
		}
	} else {
		event.locals.user = null
	}

	return resolve(event)
}
