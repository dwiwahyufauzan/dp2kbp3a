import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { createAPI } from '$lib/server/api'

const LIMIT = 15

export const load: PageServerLoad = async ({ cookies, locals, url }) => {
	// Halaman revisi hanya untuk petugas & admin
	const role = locals.user?.namaRole
	if (!locals.user || !['petugas', 'admin'].includes(role ?? '')) {
		redirect(302, '/laporan')
	}

	const session = cookies.get('session') ?? ''
	const api = createAPI(`session=${session}`)
	const page = parseInt(url.searchParams.get('page') ?? '1', 10) || 1

	const params = new URLSearchParams()
	params.set('status', 'Revisi')
	params.set('page', String(page))
	params.set('limit', String(LIMIT))

	let laporan: unknown[] = []
	let total = 0
	let totalPages = 1

	try {
		const res = await api.get(`/laporan?${params.toString()}`)
		if (res.ok) {
			const json = await res.json() as { data: unknown[]; total: number; totalPages: number }
			laporan    = json.data ?? []
			total      = json.total ?? 0
			totalPages = json.totalPages ?? 1
		}
	} catch (err) {
		console.error('[Loader Error] Gagal memuat data revisi:', err)
		laporan = []
	}

	return { laporan, total, page, totalPages, limit: LIMIT }
}
