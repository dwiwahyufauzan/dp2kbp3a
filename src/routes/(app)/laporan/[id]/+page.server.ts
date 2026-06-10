import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { createAPI } from '$lib/server/api'

export const load: PageServerLoad = async ({ cookies, params, locals }) => {
	const session = cookies.get('session') ?? ''
	const api = createAPI(`session=${session}`)

	const [resLaporan, resJenis, resBidang] = await Promise.all([
		api.get(`/laporan/${params.id}`),
		api.get('/jenis-kegiatan'),
		api.get('/admin/bidang')
	])

	if (!resLaporan.ok) {
		redirect(302, '/laporan')
	}

	const laporan = await resLaporan.json()
	// laporan sekarang sudah include riwayatRevisi dari backend
	let jenisKegiatan: { idJenis: string; namaKegiatan: string; idBidang: string | null }[] = []
	if (resJenis.ok) jenisKegiatan = await resJenis.json()

	let bidangList: { idBidang: string; namaBidang: string }[] = []
	if (resBidang.ok) bidangList = await resBidang.json()

	return { laporan, jenisKegiatan, bidangList, user: locals.user }
}

export const actions: Actions = {
	// Edit laporan (petugas, status Pending/Revisi)
	edit: async ({ request, cookies, params }) => {
		const session = cookies.get('session') ?? ''
		const api = createAPI(`session=${session}`)

		const form = await request.formData()
		const body: Record<string, unknown> = {}

		const idBidang = form.get('idBidang') as string
		const tanggalKegiatan = form.get('tanggalKegiatan') as string
		const idJenis = form.get('idJenis') as string
		const lokasiDetail = form.get('lokasiDetail') as string
		const jumlahPeserta = form.get('jumlahPeserta') as string
		const jumlahLaki = form.get('jumlahLaki') as string
		const jumlahPerempuan = form.get('jumlahPerempuan') as string
		const deskripsiKegiatan = form.get('deskripsiKegiatan') as string

		if (idBidang) body.idBidang = idBidang
		if (tanggalKegiatan) body.tanggalKegiatan = tanggalKegiatan
		if (idJenis) body.idJenis = idJenis
		if (lokasiDetail) body.lokasiDetail = lokasiDetail
		if (jumlahPeserta) body.jumlahPeserta = Number(jumlahPeserta)
		if (jumlahLaki) body.jumlahLaki = Number(jumlahLaki)
		if (jumlahPerempuan) body.jumlahPerempuan = Number(jumlahPerempuan)
		if (deskripsiKegiatan) body.deskripsiKegiatan = deskripsiKegiatan

		const res = await api.patch(`/laporan/${params.id}`, body)
		if (!res.ok) {
			const data = await res.json().catch(() => ({}))
			return fail(res.status, { editError: (data as { message?: string }).message ?? 'Gagal memperbarui' })
		}
		return { editSuccess: true }
	},

	// Verifikasi laporan (kepala_bidang / admin)
	verifikasi: async ({ request, cookies, params }) => {
		const session = cookies.get('session') ?? ''
		const api = createAPI(`session=${session}`)

		const form = await request.formData()
		const statusVerifikasi = form.get('statusVerifikasi') as string
		const catatanVerifikator = (form.get('catatanVerifikator') as string)?.trim()

		if (!statusVerifikasi) {
			return fail(400, { verifikasiError: 'Status verifikasi wajib dipilih' })
		}

		const body: Record<string, unknown> = { statusVerifikasi }
		if (catatanVerifikator) body.catatanVerifikator = catatanVerifikator

		const res = await api.patch(`/laporan/${params.id}/verifikasi`, body)

		if (!res.ok) {
			const data = await res.json().catch(() => ({}))
			return fail(res.status, { verifikasiError: (data as { message?: string }).message ?? 'Gagal memverifikasi' })
		}
		return { verifikasiSuccess: true }
	},

	// Upload dokumentasi
	uploadDokumentasi: async ({ request, cookies, params }) => {
		const session = cookies.get('session') ?? ''
		const api = createAPI(`session=${session}`)

		const form = await request.formData()
		const file = form.get('file') as File | null

		if (!file || file.size === 0) {
			return fail(400, { uploadError: 'Pilih file terlebih dahulu' })
		}

		const uploadForm = new FormData()
		uploadForm.append('file', file)

		const res = await api.postForm(`/laporan/${params.id}/dokumentasi`, uploadForm)
		if (!res.ok) {
			const data = await res.json().catch(() => ({}))
			return fail(res.status, { uploadError: (data as { message?: string }).message ?? 'Gagal upload' })
		}
		return { uploadSuccess: true }
	},

	// Hapus dokumentasi
	hapusDokumentasi: async ({ request, cookies, params }) => {
		const session = cookies.get('session') ?? ''
		const api = createAPI(`session=${session}`)

		const form = await request.formData()
		const idDok = form.get('idDok') as string

		const res = await api.del(`/laporan/${params.id}/dokumentasi/${idDok}`)
		if (!res.ok) {
			const data = await res.json().catch(() => ({}))
			return fail(res.status, { hapusError: (data as { message?: string }).message ?? 'Gagal menghapus' })
		}
		return { hapusSuccess: true }
	},

	// Hapus laporan
	hapusLaporan: async ({ cookies, params }) => {
		const session = cookies.get('session') ?? ''
		const api = createAPI(`session=${session}`)

		const res = await api.del(`/laporan/${params.id}`)
		if (!res.ok) {
			const data = await res.json().catch(() => ({}))
			return fail(res.status, { hapusLaporanError: (data as { message?: string }).message ?? 'Gagal menghapus' })
		}
		redirect(302, '/laporan')
	}
}
