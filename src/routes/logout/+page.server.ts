import { redirect } from '@sveltejs/kit'
import type { Actions } from './$types'

const BACKEND = 'http://localhost:3000'

export const actions: Actions = {
	default: async ({ cookies }) => {
		const session = cookies.get('session')
		if (session) {
			await fetch(`${BACKEND}/auth/logout`, {
				method: 'POST',
				headers: { Cookie: `session=${session}` }
			}).catch(() => {})
		}
		cookies.delete('session', { path: '/' })
		redirect(302, '/login')
	}
}
