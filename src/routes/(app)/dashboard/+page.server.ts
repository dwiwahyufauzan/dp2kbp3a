import type { PageServerLoad } from './$types'
import { createAPI } from '$lib/server/api'

export const load: PageServerLoad = async ({ cookies, locals, parent }) => {
	const { profil } = await parent()
	const permissions = profil?.permissions || []
	const role = locals.user?.namaRole

	const session = cookies.get('session') ?? ''
	const api = createAPI(`session=${session}`)

	// Ambil statistik ringkas
	let stats = { totalLaporan: 0, totalPeserta: 0, totalLaki: 0, totalPerempuan: 0 }
	let byStatus: Record<string, number> = {}
	let laporanTerbaru: unknown[] = []

	try {
		// Statistik (hanya jika memiliki izin lihat_statistik)
		const hasStatPerm = role === 'admin' || permissions.includes('lihat_statistik')
		if (hasStatPerm) {
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
