import type { RequestHandler } from './$types'
import { createAPI } from '$lib/server/api'

export const GET: RequestHandler = async ({ cookies, url }) => {
	const session = cookies.get('session') ?? ''
	const api = createAPI(`session=${session}`)

	if (!session) {
		return new Response('Tidak terautentikasi', { status: 401 })
	}

	const periode  = url.searchParams.get('periode')  ?? ''
	const idBidang = url.searchParams.get('idBidang') ?? ''

	const params = new URLSearchParams()
	if (periode)  params.set('periode',  periode)
	if (idBidang) params.set('idBidang', idBidang)

	const res = await api.get(`/rekap${params.size > 0 ? '?' + params.toString() : ''}`)
	if (!res.ok) {
		return new Response('Gagal mengambil data rekap', { status: 500 })
	}

	interface RekapRow {
		namaLengkap: string
		namaBidang: string | null
		totalLaporan: number
		totalPeserta: number
		totalDisetujui: number
		totalMenunggu: number
		totalDitolak: number
		totalRevisi: number
	}

	const rekap: RekapRow[] = await res.json()

	// Buat CSV
	const header = ['Nama Petugas', 'Bidang', 'Total Laporan', 'Total Peserta', 'Disetujui', 'Menunggu', 'Ditolak', 'Revisi']
	const rows = rekap.map((r) => [
		`"${(r.namaLengkap ?? '').replace(/"/g, '""')}"`,
		`"${(r.namaBidang ?? '-').replace(/"/g, '""')}"`,
		r.totalLaporan,
		r.totalPeserta,
		r.totalDisetujui,
		r.totalMenunggu,
		r.totalDitolak,
		r.totalRevisi,
	])

	const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\r\n')

	const filename = `rekap${periode ? '-' + periode : ''}.csv`

	return new Response(csv, {
		headers: {
			'Content-Type': 'text/csv; charset=utf-8',
			'Content-Disposition': `attachment; filename="${filename}"`,
		},
	})
}
