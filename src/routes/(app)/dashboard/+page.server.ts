import type { PageServerLoad } from './$types'
import { createAPI } from '$lib/server/api'

export const load: PageServerLoad = async ({ cookies, locals }) => {
	const session = cookies.get('session') ?? ''
	const api = createAPI(`session=${session}`)

	// Ambil statistik ringkas
	let stats = { totalLaporan: 0, totalPeserta: 0, totalLaki: 0, totalPerempuan: 0 }
	let byStatus: Record<string, number> = {}
	let laporanTerbaru: unknown[] = []

	const role = locals.user?.namaRole

	try {
		// Statistik (hanya untuk admin, kepala_bidang, pimpinan)
		if (role !== 'petugas') {
			const resStats = await api.get('/statistik')
			if (resStats.ok) {
				const data = await resStats.json()
				stats = {
					totalLaporan: data.totalLaporan ?? 0,
					totalPeserta: data.totalPeserta ?? 0,
					totalLaki: data.totalLaki ?? 0,
					totalPerempuan: data.totalPerempuan ?? 0,
				}
				byStatus = data.byStatus ?? {}
			}
		}

		// Laporan terbaru
		const resLaporan = await api.get('/laporan?limit=6')
		if (resLaporan.ok) {
			const json = await resLaporan.json()
			laporanTerbaru = Array.isArray(json) ? json.slice(0, 6) : Array.isArray(json.data) ? json.data.slice(0, 6) : []
		}
	} catch {
		// Abaikan error koneksi, tampilkan kosong
	}

	return { stats, byStatus, laporanTerbaru, role }
}
