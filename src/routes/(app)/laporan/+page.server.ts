import type { PageServerLoad } from './$types'
import { createAPI } from '$lib/server/api'

const LIMIT = 15

export const load: PageServerLoad = async ({ cookies, url }) => {
	const session = cookies.get('session') ?? ''
	const api = createAPI(`session=${session}`)

	const status = url.searchParams.get('status') ?? ''
	const search = url.searchParams.get('search') ?? ''
	const idBidang = url.searchParams.get('idBidang') ?? ''
	const idJenis = url.searchParams.get('idJenis') ?? ''
	const page   = parseInt(url.searchParams.get('page') ?? '1', 10) || 1

	const params = new URLSearchParams()
	params.set('page', String(page))
	params.set('limit', String(LIMIT))
	if (status) params.set('status', status)
	if (search) params.set('search', search)
	if (idBidang) params.set('idBidang', idBidang)
	if (idJenis) params.set('idJenis', idJenis)

	let laporan: unknown[] = []
	let total = 0
	let totalPages = 1
	let bidangList: { idBidang: string; namaBidang: string }[] = []
	let jenisKegiatan: { idJenis: string; namaKegiatan: string; idBidang: string | null }[] = []

	try {
		const [resLaporan, resBidang, resJenis] = await Promise.all([
			api.get(`/laporan?${params.toString()}`),
			api.get('/admin/bidang'),
			api.get('/jenis-kegiatan')
		])

		if (resLaporan.ok) {
			const json = await resLaporan.json() as { data: unknown[]; total: number; totalPages: number }
			laporan    = json.data      ?? []
			total      = json.total     ?? 0
			totalPages = json.totalPages ?? 1
		}
		if (resBidang.ok) bidangList = await resBidang.json()
		if (resJenis.ok) jenisKegiatan = await resJenis.json()
	} catch (err) {
		console.error('[Loader Error] Gagal memuat data laporan:', err)
		laporan = []
	}

	return { laporan, status, search, idBidang, idJenis, page, total, totalPages, limit: LIMIT, bidangList, jenisKegiatan }
}
