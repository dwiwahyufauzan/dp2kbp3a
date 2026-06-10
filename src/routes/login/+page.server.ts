import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'

import { env } from '$env/dynamic/private'

const BACKEND = env.BACKEND_URL || 'http://localhost:3000'

export const load: PageServerLoad = ({ locals }) => {
	if (locals.user) {
		redirect(302, '/dashboard')
	}
	return {}
}

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData()
		const email = (form.get('email') as string)?.trim()
		const password = form.get('password') as string

		if (!email || !password) {
			return fail(400, { error: 'Email dan password wajib diisi', email })
		}

		let res: Response
		try {
			res = await fetch(`${BACKEND}/auth/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			})
		} catch {
			return fail(503, { error: 'Tidak dapat terhubung ke server. Pastikan backend berjalan.', email })
		}

		if (!res.ok) {
			const data = await res.json().catch(() => ({}))
			return fail(res.status, { error: (data as { message?: string }).message ?? 'Login gagal', email })
		}

		// Teruskan cookie session dari backend ke browser
		const setCookie = res.headers.get('set-cookie')
		if (setCookie) {
			const match = setCookie.match(/session=([^;]+)/)
			if (match) {
				cookies.set('session', match[1], {
					path: '/',
					httpOnly: true,
					maxAge: 8 * 3600,
					sameSite: 'lax',
					secure: false
				})
			}
		}

		redirect(302, '/dashboard')
	}
}
