    import type { PageServerLoad } from './$types'
import { createAPI } from '$lib/server/api'

export const load: PageServerLoad = async ({ cookies, url }) => {
	const session = cookies.get('session') ?? ''
	const api = createAPI(`session=${session}`)

	const tahun = url.searchParams.get('tahun') ?? String(new Date().getFullYear())
	const bulan = url.searchParams.get('bulan') ?? ''
	const idBidang = url.searchParams.get('idBidang') ?? ''

	const params = new URLSearchParams()
	params.set('tahun', tahun)
	if (bulan) params.set('bulan', bulan)
	if (idBidang) params.set('idBidang', idBidang)

	const [resStats, resBidang] = await Promise.all([
		api.get(`/statistik?${params.toString()}`),
		api.get('/admin/bidang')
	])

	let stats = { totalLaporan: 0, totalPeserta: 0, byStatus: {}, byJenis: [], trenBulan: [] }
	let bidang: { idBidang: string; namaBidang: string }[] = []

	if (resStats.ok) stats = await resStats.json()
	if (resBidang.ok) bidang = await resBidang.json()

	return { stats, bidang, tahun, bulan, idBidang }
}
