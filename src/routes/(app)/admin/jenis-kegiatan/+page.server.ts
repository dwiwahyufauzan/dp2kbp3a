import { fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { createAPI } from '$lib/server/api'

export const load: PageServerLoad = async ({ cookies }) => {
	const session = cookies.get('session') ?? ''
	const api = createAPI(`session=${session}`)
	const [resKegiatan, resBidang] = await Promise.all([
		api.get('/jenis-kegiatan'),
		api.get('/admin/bidang')
	])
	return {
		jenisKegiatan: resKegiatan.ok ? await resKegiatan.json() : [],
		bidangList: resBidang.ok ? await resBidang.json() : []
	}
}

export const actions: Actions = {
	create: async ({ request, cookies }) => {
		const session = cookies.get('session') ?? ''
		const api = createAPI(`session=${session}`)
		const form = await request.formData()
		const namaKegiatan = form.get('namaKegiatan') as string
		const idBidang = form.get('idBidang') as string

		if (!namaKegiatan) return fail(400, { createError: 'Nama kegiatan wajib diisi' })

		const res = await api.post('/jenis-kegiatan', { namaKegiatan, idBidang: idBidang || null })
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
		const namaKegiatan = form.get('namaKegiatan') as string
		const idBidang = form.get('idBidang') as string

		const res = await api.patch(`/jenis-kegiatan/${id}`, { namaKegiatan, idBidang: idBidang || null })
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

		const res = await api.del(`/jenis-kegiatan/${id}`)
		if (!res.ok) {
			const data = await res.json().catch(() => ({}))
			return fail(res.status, { deleteError: (data as { message?: string }).message ?? 'Gagal menghapus' })
		}
		return { deleteSuccess: true }
	}
}
