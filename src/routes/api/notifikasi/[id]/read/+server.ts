import { createAPI } from '$lib/server/api'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const PATCH: RequestHandler = async ({ cookies, params }) => {
	const session = cookies.get('session') ?? ''
	const api = createAPI(`session=${session}`)
	await api.patch(`/notifikasi/${params.id}/read`, {})
	return json({ ok: true })
}
