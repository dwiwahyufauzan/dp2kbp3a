import { createAPI } from '$lib/server/api'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ cookies }) => {
	const session = cookies.get('session') ?? ''
	const api = createAPI(`session=${session}`)
	try {
		const res = await api.get('/notifikasi')
		if (!res.ok) {
			return json({ list: [], unread: 0 }, { status: res.status })
		}
		const data = await res.json()
		return json(data)
	} catch (err) {
		console.error('Error fetching notifications:', err)
		return json({ list: [], unread: 0 }, { status: 500 })
	}
}
