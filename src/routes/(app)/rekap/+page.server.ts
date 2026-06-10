import type { PageServerLoad } from './$types'
import { createAPI } from '$lib/server/api'

export const load: PageServerLoad = async ({ cookies, url }) => {
	const session = cookies.get('session') ?? ''
	const api = createAPI(`session=${session}`)

	const periode = url.searchParams.get('periode') ?? ''
	const idBidang = url.searchParams.get('idBidang') ?? ''

	const params = new URLSearchParams()
	if (periode) params.set('periode', periode)
	if (idBidang) params.set('idBidang', idBidang)

	const [resRekap, resBidang] = await Promise.all([
		api.get(`/rekap${params.size > 0 ? '?' + params.toString() : ''}`),
		api.get('/admin/bidang')
	])

	let rekap: unknown[] = []
	let bidang: { idBidang: string; namaBidang: string }[] = []

	if (resRekap.ok) rekap = (await resRekap.json()) ?? []
	if (resBidang.ok) bidang = (await resBidang.json()) ?? []

	return { rekap, bidang, periode, idBidang }
}
