import { createAPI } from '$lib/server/api'
import { redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ cookies, request }) => {
	const session = cookies.get('session') ?? ''
	const api = createAPI(`session=${session}`)
	await api.patch('/notifikasi/read-all', {})

	const referer = request.headers.get('referer') ?? '/'
	redirect(303, referer)
}
