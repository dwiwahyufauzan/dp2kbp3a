import type { RequestHandler } from './$types'
import { BACKEND } from '$lib/server/api'

export const GET: RequestHandler = async ({ params }) => {
	// Sanitasi nama file untuk mencegah path traversal
	const filename = params.file.replace(/[^a-zA-Z0-9._-]/g, '')
	if (!filename || filename !== params.file) {
		return new Response('File tidak ditemukan', { status: 404 })
	}

	const res = await fetch(`${BACKEND}/uploads/${filename}`)
	if (!res.ok) {
		return new Response('File tidak ditemukan', { status: 404 })
	}

	const contentType = res.headers.get('content-type') ?? 'application/octet-stream'
	const body = await res.arrayBuffer()

	return new Response(body, {
		headers: {
			'Content-Type': contentType,
			'Cache-Control': 'public, max-age=31536000',
		},
	})
}
