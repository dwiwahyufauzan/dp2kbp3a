import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const cache = new Map<string, unknown[]>()

export const GET: RequestHandler = async ({ fetch, params }) => {
	const id = params.id
	if (cache.has(id)) return json(cache.get(id))
	try {
		const res = await fetch(
			`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${id}.json`
		)
		if (!res.ok) return json([])
		const data = await res.json()
		cache.set(id, data)
		return json(data)
	} catch {
		return json([])
	}
}
