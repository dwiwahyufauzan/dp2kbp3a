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
	const canManage = role === 'admin' || permissions.includes('kelola_pengguna')
	if (!canManage) {
		redirect(302, '/dashboard')
	}

	const session = cookies.get('session') ?? ''
	const api = createAPI(`session=${session}`)

	const [resPengguna, resRoles, resBidang] = await Promise.all([
		api.get('/admin/pengguna'),
		api.get('/admin/pengguna/roles'),
		api.get('/admin/bidang')
	])

	return {
		pengguna: resPengguna.ok ? await resPengguna.json() : [],
		roles: resRoles.ok ? await resRoles.json() : [],
		bidang: resBidang.ok ? await resBidang.json() : []
	}
}

export const actions: Actions = {
	create: async ({ request, cookies }) => {
		const session = cookies.get('session') ?? ''
		const api = createAPI(`session=${session}`)

		const form = await request.formData()
		const namaKecamatan = (form.get('namaKecamatan') as string | null)?.trim() ?? ''

		// Resolve idLokasi: find-or-create from namaKecamatan + namaDesa ('-')
		let idLokasi: string | null = null
		if (namaKecamatan) {
			const namaDesa = '-'
			const resCreate = await api.post('/admin/lokasi-tugas', { namaKecamatan, namaDesa })
			if (resCreate.ok) {
				const created = await resCreate.json() as { idLokasi: string }
				idLokasi = created.idLokasi
			} else if (resCreate.status === 409) {
				// Already exists — find it by name
				const resFind = await api.get(`/admin/lokasi-tugas?kecamatan=${encodeURIComponent(namaKecamatan)}`)
				if (resFind.ok) {
					const list = await resFind.json() as { idLokasi: string; namaDesa: string; namaKecamatan: string }[]
					const match = list.find((l) => l.namaKecamatan.toLowerCase() === namaKecamatan.toLowerCase() && l.namaDesa === '-')
					if (match) idLokasi = match.idLokasi
				}
			}
		}

		const body = {
			namaLengkap: form.get('namaLengkap') as string,
			email: form.get('email') as string,
			password: form.get('password') as string,
			idRole: form.get('idRole') as string,
			idBidang: form.get('idBidang') || null,
			idLokasi
		}

		if (!body.namaLengkap || !body.email || !body.password || !body.idRole) {
			return fail(400, { createError: 'Nama, email, password, dan role wajib diisi' })
		}

		const res = await api.post('/admin/pengguna', body)
		if (!res.ok) {
			const data = await res.json().catch(() => ({}))
			return fail(res.status, { createError: (data as { message?: string }).message ?? 'Gagal membuat pengguna' })
		}
		return { createSuccess: true }
	},

	update: async ({ request, cookies }) => {
		const session = cookies.get('session') ?? ''
		const api = createAPI(`session=${session}`)

		const form = await request.formData()
		const id = form.get('id') as string
		const body: Record<string, unknown> = {}

		const namaLengkap = form.get('namaLengkap') as string
		const email = form.get('email') as string
		const password = form.get('password') as string
		const idRole = form.get('idRole') as string
		const idBidang = form.get('idBidang') as string
		const statusAktif = form.get('statusAktif') as string
		const namaKecamatan = (form.get('namaKecamatan') as string | null)?.trim() ?? ''

		// Resolve idLokasi for update
		let idLokasi: string | null = null
		if (namaKecamatan) {
			const namaDesa = '-'
			const resCreate = await api.post('/admin/lokasi-tugas', { namaKecamatan, namaDesa })
			if (resCreate.ok) {
				const created = await resCreate.json() as { idLokasi: string }
				idLokasi = created.idLokasi
			} else if (resCreate.status === 409) {
				const resFind = await api.get(`/admin/lokasi-tugas?kecamatan=${encodeURIComponent(namaKecamatan)}`)
				if (resFind.ok) {
					const list = await resFind.json() as { idLokasi: string; namaDesa: string; namaKecamatan: string }[]
					const match = list.find((l) => l.namaKecamatan.toLowerCase() === namaKecamatan.toLowerCase() && l.namaDesa === '-')
					if (match) idLokasi = match.idLokasi
				}
			}
		}

		if (namaLengkap) body.namaLengkap = namaLengkap
		if (email) body.email = email
		if (password) body.password = password
		if (idRole) body.idRole = idRole
		body.idBidang = idBidang || null
		body.idLokasi = idLokasi
		if (statusAktif) body.statusAktif = statusAktif

		const res = await api.patch(`/admin/pengguna/${id}`, body)
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

		const res = await api.del(`/admin/pengguna/${id}`)
		if (!res.ok) {
			const data = await res.json().catch(() => ({}))
			return fail(res.status, { deleteError: (data as { message?: string }).message ?? 'Gagal menghapus' })
		}
		return { deleteSuccess: true }
	}
}
