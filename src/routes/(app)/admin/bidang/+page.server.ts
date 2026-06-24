import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { createAPI } from '$lib/server/api'

export const load: PageServerLoad = async ({ cookies, parent, locals }) => {
	const { profil } = await parent()
	const role = locals.user?.namaRole
	let permissions = profil?.permissions || []
	if (typeof permissions === 'string') {
		try { permissions = JSON.parse(permissions) } catch { permissions = [] }
	}
	const canManage = role === 'admin' || permissions.includes('kelola_master')
	if (!canManage) {
		redirect(302, '/dashboard')
	}

	const session = cookies.get('session') ?? ''
	const api = createAPI(`session=${session}`)
	const res = await api.get('/admin/bidang')
	return { bidang: res.ok ? await res.json() : [] }
}

export const actions: Actions = {
	create: async ({ request, cookies }) => {
		const session = cookies.get('session') ?? ''
		const api = createAPI(`session=${session}`)
		const form = await request.formData()
		const namaBidang = form.get('namaBidang') as string
		const deskripsi = form.get('deskripsi') as string

		if (!namaBidang) return fail(400, { createError: 'Nama bidang wajib diisi' })

		const res = await api.post('/admin/bidang', { namaBidang, deskripsi: deskripsi || null })
		if (!res.ok) {
			const data = await res.json().catch(() => ({}))
			return fail(res.status, { createError: (data as { message?: string }).message ?? 'Gagal membuat' })
		}
		return { createSuccess: true }
	},

	update: async ({ request, cookies }) => {
		const session = cookies.get('session') ?? ''
		const api = createAPI(`session=${session}`)
		const form = await request.formData()
		const id = form.get('id') as string
		const namaBidang = form.get('namaBidang') as string
		const deskripsi = form.get('deskripsi') as string

		const res = await api.patch(`/admin/bidang/${id}`, { namaBidang, deskripsi: deskripsi || null })
		if (!res.ok) {
			const data = await res.json().catch(() => ({}))
			return fail(res.status, { updateError: (data as { message?: string }).message ?? 'Gagal memperbarui' })
		}
		return { updateSuccess: true }
	},

	delete: async ({ request, cookies }) => {
		const session = cookies.get('session') ?? ''
		const api = createAPI(`session=${session}`)
		const form = await request.formData()
		const id = form.get('id') as string

		const res = await api.del(`/admin/bidang/${id}`)
		if (!res.ok) {
			const data = await res.json().catch(() => ({}))
			return fail(res.status, { deleteError: (data as { message?: string }).message ?? 'Gagal menghapus' })
		}
		return { deleteSuccess: true }
	}
}
