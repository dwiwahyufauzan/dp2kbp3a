import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { createAPI } from '$lib/server/api'

export const load: PageServerLoad = async ({ cookies, url, parent, locals }) => {
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
	const kecamatan = url.searchParams.get('kecamatan') ?? ''
	const path = kecamatan ? `/admin/lokasi-tugas?kecamatan=${encodeURIComponent(kecamatan)}` : '/admin/lokasi-tugas'
	const res = await api.get(path)
	return { lokasi: res.ok ? await res.json() : [], kecamatan }
}

export const actions: Actions = {
	create: async ({ request, cookies }) => {
		const session = cookies.get('session') ?? ''
		const api = createAPI(`session=${session}`)
		const form = await request.formData()
		const namaKecamatan = form.get('namaKecamatan') as string
		const namaDesa = form.get('namaDesa') as string

		if (!namaKecamatan || !namaDesa) return fail(400, { createError: 'Kecamatan dan desa/kelurahan wajib diisi' })

		const res = await api.post('/admin/lokasi-tugas', { namaKecamatan, namaDesa })
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
		const namaKecamatan = form.get('namaKecamatan') as string
		const namaDesa = form.get('namaDesa') as string

		const res = await api.patch(`/admin/lokasi-tugas/${id}`, { namaKecamatan, namaDesa })
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

		const res = await api.del(`/admin/lokasi-tugas/${id}`)
		if (!res.ok) {
			const data = await res.json().catch(() => ({}))
			return fail(res.status, { deleteError: (data as { message?: string }).message ?? 'Gagal menghapus' })
		}
		return { deleteSuccess: true }
	}
}
