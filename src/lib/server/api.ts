const BACKEND = 'http://localhost:3000'

/**
 * Buat API client yang meneruskan cookie session ke backend.
 * Digunakan di server-side load functions & form actions.
 */
export function createAPI(cookieHeader: string) {
	const baseHeaders = { Cookie: cookieHeader }

	return {
		async get(path: string): Promise<Response> {
			return fetch(`${BACKEND}${path}`, { headers: baseHeaders })
		},

		async post(path: string, body?: unknown): Promise<Response> {
			return fetch(`${BACKEND}${path}`, {
				method: 'POST',
				headers: { ...baseHeaders, 'Content-Type': 'application/json' },
				body: body !== undefined ? JSON.stringify(body) : undefined
			})
		},

		async patch(path: string, body: unknown): Promise<Response> {
			return fetch(`${BACKEND}${path}`, {
				method: 'PATCH',
				headers: { ...baseHeaders, 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			})
		},

		async del(path: string): Promise<Response> {
			return fetch(`${BACKEND}${path}`, {
				method: 'DELETE',
				headers: baseHeaders
			})
		},

		async postForm(path: string, formData: FormData): Promise<Response> {
			return fetch(`${BACKEND}${path}`, {
				method: 'POST',
				headers: baseHeaders,
				body: formData
			})
		}
	}
}

export { BACKEND }
