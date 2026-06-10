import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

// Proxy ke API Wilayah Indonesia (emsifa)
// Cache sederhana di memory agar tidak terus fetch
let cache: unknown[] | null = null

export const GET: RequestHandler = async ({ fetch }) => {
	if (cache) return json(cache)
	try {
		const res = await fetch(
			'https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json'
		)
		if (!res.ok) return json([])
		cache = await res.json()
		return json(cache)
	} catch {
		return json([])
	}
}
