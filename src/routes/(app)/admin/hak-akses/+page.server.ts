import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { createAPI } from '$lib/server/api'

export const load: PageServerLoad = async ({ cookies, locals, parent }) => {
	const { profil } = await parent()
	const role = locals.user?.namaRole
	let permissions = profil?.permissions || []
	if (typeof permissions === 'string') {
		try { permissions = JSON.parse(permissions) } catch { permissions = [] }
	}
	const canManage = role === 'admin' || permissions.includes('kelola_hak_akses')
	if (!canManage) {
		redirect(302, '/dashboard')
	}

	const session = cookies.get('session') ?? ''
	const api = createAPI(`session=${session}`)

	const res = await api.get('/admin/hak-akses')
	let rolesList = res.ok ? await res.json() : []

	if (Array.isArray(rolesList)) {
		rolesList = rolesList.map(r => {
			let perms = r.permissions;
			if (typeof perms === 'string') {
				try { perms = JSON.parse(perms) } catch { perms = [] }
			}
			return { ...r, permissions: perms || [] }
		})
	}

	return {
		roles: rolesList
	}
}

export const actions: Actions = {
	updatePermissions: async ({ request, cookies }) => {
		const session = cookies.get('session') ?? ''
		const api = createAPI(`session=${session}`)

		const form = await request.formData()
		const idRole = form.get('idRole') as string
		const permissionsRaw = form.get('permissions') as string

		if (!idRole) {
			return fail(400, { error: 'ID Role wajib diisi' })
		}

		let permissions: string[] = []
		try {
			permissions = JSON.parse(permissionsRaw)
		} catch {
			return fail(400, { error: 'Format data permissions tidak valid' })
		}

		const res = await api.patch(`/admin/hak-akses/${idRole}`, { permissions })
		if (!res.ok) {
			const data = await res.json().catch(() => ({}))
			return fail(res.status, { error: (data as { message?: string }).message ?? 'Gagal memperbarui hak akses' })
		}

		return { success: true }
	}
}
