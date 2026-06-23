import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { createAPI } from '$lib/server/api'

export const load: PageServerLoad = async ({ cookies, url, parent }) => {
	const { profil } = await parent()
	const permissions = profil?.permissions || []
	const role = profil?.namaRole

	const canRecap = role === 'admin' || permissions.includes('rekap_laporan')
	if (!canRecap) {
		redirect(303, '/dashboard')
	}

	const session = cookies.get('session') ?? ''
	const api = createAPI(`session=${session}`)

	const periode = url.searchParams.get('periode') ?? ''
	const idBidang = url.searchParams.get('idBidang') ?? ''
	const idUser = url.searchParams.get('idUser') ?? ''
	const kecamatan = url.searchParams.get('kecamatan') ?? ''
	const startDate = url.searchParams.get('startDate') ?? ''
	const endDate = url.searchParams.get('endDate') ?? ''

	const params = new URLSearchParams()
	if (periode) params.set('periode', periode)
	if (idBidang) params.set('idBidang', idBidang)
	if (idUser) params.set('idUser', idUser)
	if (kecamatan) params.set('kecamatan', kecamatan)
	if (startDate) params.set('startDate', startDate)
	if (endDate) params.set('endDate', endDate)

	let rekap: unknown[] = []
	let bidang: { idBidang: string; namaBidang: string }[] = []
	let petugasList: { idUser: string; namaLengkap: string }[] = []
	let kecamatanList: { namaKecamatan: string }[] = []

	try {
		const [resRekap, resBidang, resPetugas, resKecamatan] = await Promise.all([
			api.get(`/rekap${params.size > 0 ? '?' + params.toString() : ''}`),
			api.get('/admin/bidang'),
			api.get('/rekap/petugas'),
			api.get('/rekap/kecamatan')
		])
		if (resRekap.ok) rekap = (await resRekap.json()) ?? []
		if (resBidang.ok) bidang = (await resBidang.json()) ?? []
		if (resPetugas.ok) petugasList = (await resPetugas.json()) ?? []
		if (resKecamatan.ok) kecamatanList = (await resKecamatan.json()) ?? []
	} catch (err) {
		console.error('[Loader Error] Gagal memuat data rekapitulasi:', err)
	}

	return {
		rekap,
		bidang,
		petugasList,
		kecamatanList,
		periode,
		idBidang,
		idUser,
		kecamatan,
		startDate,
		endDate
	}
}
