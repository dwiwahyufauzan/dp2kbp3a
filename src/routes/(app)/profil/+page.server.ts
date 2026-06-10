import { fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { createAPI } from '$lib/server/api'

export const load: PageServerLoad = async ({ cookies }) => {
	const session = cookies.get('session') ?? ''
	const api = createAPI(`session=${session}`)
	const res = await api.get('/profil')
	return { profil: res.ok ? await res.json() : null }
}

export const actions: Actions = {
	update: async ({ request, cookies }) => {
		const session = cookies.get('session') ?? ''
		const api = createAPI(`session=${session}`)
		const form = await request.formData()

		const body: Record<string, string> = {}
		const namaLengkap = (form.get('namaLengkap') as string)?.trim()
		const email = (form.get('email') as string)?.trim()
		const password = (form.get('password') as string)?.trim()

		if (namaLengkap) body.namaLengkap = namaLengkap
		if (email) body.email = email
		if (password) {
			if (password.length < 8) return fail(400, { error: 'Password minimal 8 karakter' })
			body.password = password
		}

		if (Object.keys(body).length === 0) return fail(400, { error: 'Tidak ada perubahan' })

		const res = await api.patch('/profil', body)
		if (!res.ok) {
			const data = await res.json().catch(() => ({}))
			return fail(res.status, { error: (data as { message?: string }).message ?? 'Gagal memperbarui profil' })
		}
		return { success: true }
	}
}
