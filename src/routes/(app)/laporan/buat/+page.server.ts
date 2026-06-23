import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { createAPI } from '$lib/server/api'

export const load: PageServerLoad = async ({ cookies, locals, parent }) => {
	const { profil } = await parent()
	const permissions = profil?.permissions || []
	const role = locals.user?.namaRole

	const canCreate = role === 'admin' || permissions.includes('buat_laporan')
	if (!canCreate) {
		redirect(302, '/laporan')
	}

	const session = cookies.get('session') ?? ''
	const api = createAPI(`session=${session}`)

	// Ambil semua bidang (untuk dropdown pilihan)
	let bidangList: { idBidang: string; namaBidang: string }[] = []
	try {
		const res = await api.get('/admin/bidang')
		if (res.ok) bidangList = await res.json()
	} catch {
		bidangList = []
	}

	// Ambil semua kegiatan beserta idBidang (untuk filter client-side)
	let jenisKegiatan: { idJenis: string; namaKegiatan: string; idBidang: string | null }[] = []
	try {
		const res = await api.get('/jenis-kegiatan')
		if (res.ok) jenisKegiatan = await res.json()
	} catch {
		jenisKegiatan = []
	}

	return { bidangList, jenisKegiatan }
}

export const actions: Actions = {
	default: async ({ request, cookies, locals }) => {
		const session = cookies.get('session') ?? ''
		const api = createAPI(`session=${session}`)

		const form = await request.formData()
		const idBidang = form.get('idBidang') as string
		const tanggalKegiatan = form.get('tanggalKegiatan') as string
		const idJenis = form.get('idJenis') as string
		const lokasiDetail = form.get('lokasiDetail') as string
		const jumlahPeserta = form.get('jumlahPeserta') as string
		const deskripsiKegiatan = form.get('deskripsiKegiatan') as string
		const files = form.getAll('berkas') as File[]

		const values = { idBidang, tanggalKegiatan, idJenis, lokasiDetail, jumlahPeserta, deskripsiKegiatan }

		if (!idBidang || !tanggalKegiatan || !idJenis || !lokasiDetail || !jumlahPeserta || !deskripsiKegiatan) {
			return fail(400, { error: 'Semua kolom wajib diisi', values })
		}

		const payload: Record<string, unknown> = {
			idBidang,
			tanggalKegiatan,
			idJenis,
			lokasiDetail,
			jumlahPeserta: Number(jumlahPeserta),
			deskripsiKegiatan,
			jumlahLaki: form.get('jumlahLaki') ? Number(form.get('jumlahLaki')) : null,
			jumlahPerempuan: form.get('jumlahPerempuan') ? Number(form.get('jumlahPerempuan')) : null,
		}

		const res = await api.post('/laporan', payload)
		if (!res.ok) {
			const data = await res.json().catch(() => ({}))
			return fail(res.status, { error: (data as { message?: string }).message ?? 'Gagal membuat laporan', values })
		}

		const created = await res.json() as { idLaporan: string }

		// Upload dokumentasi
		const validFiles = files.filter(f => f && f.size > 0)
		for (const file of validFiles.slice(0, 10)) {
			const fd = new FormData()
			fd.append('file', file)
			await api.postForm(`/laporan/${created.idLaporan}/dokumentasi`, fd)
		}

		redirect(302, `/laporan/${created.idLaporan}`)
	}
}
