import type { PageServerLoad } from './$types'
import { createAPI } from '$lib/server/api'

const LIMIT = 15

export const load: PageServerLoad = async ({ cookies, url }) => {
	const session = cookies.get('session') ?? ''
	const api = createAPI(`session=${session}`)

	const status = url.searchParams.get('status') ?? ''
	const search = url.searchParams.get('search') ?? ''
	const page   = parseInt(url.searchParams.get('page') ?? '1', 10) || 1

	const params = new URLSearchParams()
	params.set('page', String(page))
	params.set('limit', String(LIMIT))
	if (status) params.set('status', status)
	if (search) params.set('search', search)

	let laporan: unknown[] = []
	let total = 0
	let totalPages = 1

	try {
		const res = await api.get(`/laporan?${params.toString()}`)
		if (res.ok) {
			const json = await res.json() as { data: unknown[]; total: number; totalPages: number }
			laporan    = json.data      ?? []
			total      = json.total     ?? 0
			totalPages = json.totalPages ?? 1
		}
	} catch {
		laporan = []
	}

	return { laporan, status, search, page, total, totalPages, limit: LIMIT }
}
