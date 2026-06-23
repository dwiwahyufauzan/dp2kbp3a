import { redirect } from '@sveltejs/kit'
import { fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { createAPI } from '$lib/server/api'

export const load: PageServerLoad = async ({ cookies, locals, parent }) => {
	const { profil } = await parent()
	const permissions = profil?.permissions || []
	const role = locals.user?.namaRole

	const canVerify = role === 'admin' || permissions.includes('verifikasi_laporan')
	if (!canVerify) {
		redirect(303, '/dashboard')
	}

	const session = cookies.get('session') ?? ''
	const api = createAPI(`session=${session}`)
	const res = await api.get('/verifikasi')
	return { antrian: res.ok ? await res.json() : [] }
}

export const actions: Actions = {
	verifikasi: async ({ request, cookies }) => {
		const session = cookies.get('session') ?? ''
		const api = createAPI(`session=${session}`)
		const form = await request.formData()
		const id = form.get('id') as string
		const statusVerifikasi = form.get('statusVerifikasi') as string
		const catatanVerifikator = (form.get('catatanVerifikator') as string) || undefined

		const res = await api.post(`/verifikasi/${id}`, { statusVerifikasi, catatanVerifikator })
		if (!res.ok) {
			const data = await res.json().catch(() => ({}))
			return fail(res.status, { error: (data as { message?: string }).message ?? 'Gagal memverifikasi' })
		}
		return { success: true, status: statusVerifikasi }
	}
}
