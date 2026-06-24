import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'
import { createAPI } from '$lib/server/api'
import { env } from '$env/dynamic/private'

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
	if (!locals.user) {
		redirect(302, '/login')
	}

	const session = cookies.get('session') ?? ''
	const api = createAPI(`session=${session}`)
	const role = locals.user?.namaRole

	let pendingCount = 0
	if (role === 'kepala_bidang' || role === 'admin') {
		try {
			const res = await api.get('/laporan/count-pending')
			if (res.ok) {
				const json = await res.json() as { count: number }
				pendingCount = json.count ?? 0
			}
		} catch { /* abaikan */ }
	}

	// Hitung laporan yang perlu direvisi (untuk badge petugas)
	let revisiCount = 0
	if (role === 'petugas') {
		try {
			const res = await api.get('/laporan?status=Revisi&limit=1&page=1')
			if (res.ok) {
				const json = await res.json() as { total: number }
				revisiCount = json.total ?? 0
			}
		} catch { /* abaikan */ }
	}

	let notifikasi: { idNotif: string; judul: string; pesan: string; tipe: string; idReferensi: string | null; isRead: number; createdAt: string }[] = []
	let unreadNotif = 0
	try {
		const res = await api.get('/notifikasi')
		if (res.ok) {
			const json = await res.json() as { list: typeof notifikasi; unread: number }
			notifikasi = json.list ?? []
			unreadNotif = json.unread ?? 0
		}
	} catch { /* abaikan */ }

	let profil: { namaLengkap: string; email: string; namaRole: string; permissions?: string[]; namaBidang?: string; namaKecamatan?: string; namaDesa?: string } | null = null
	try {
		const res = await api.get('/profil')
		if (res.ok) {
			profil = await res.json()
			if (profil && typeof profil.permissions === 'string') {
				try {
					profil.permissions = JSON.parse(profil.permissions)
				} catch {
					profil.permissions = []
				}
			}
		}
	} catch { /* abaikan */ }

	// Fallback untuk profil jika API gagal terhubung
	if (!profil && locals.user) {
		const defaultPermissions: Record<string, string[]> = {
			admin: ['buat_laporan', 'verifikasi_laporan', 'rekap_laporan', 'lihat_statistik', 'kelola_master', 'kelola_pengguna', 'kelola_hak_akses'],
			petugas: ['buat_laporan', 'lihat_statistik'],
			kepala_bidang: ['verifikasi_laporan', 'rekap_laporan', 'lihat_statistik'],
			pimpinan: ['rekap_laporan', 'lihat_statistik']
		}
		profil = {
			namaLengkap: locals.user.namaLengkap,
			email: locals.user.email,
			namaRole: locals.user.namaRole,
			permissions: defaultPermissions[locals.user.namaRole] || []
		}
	}

	return { user: locals.user, pendingCount, revisiCount, notifikasi, unreadNotif, profil, backendUrl: env.BACKEND_URL || 'http://localhost:3000' }
}
