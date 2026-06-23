import { db } from '../db/connection'
import { roles } from '../db/schema'
import { eq } from 'drizzle-orm'

/**
 * Memeriksa apakah role tertentu memiliki hak akses (permission) yang ditentukan.
 * Role 'admin' selalu mengembalikan nilai true.
 */
export async function hasPermission(namaRole: string, permission: string): Promise<boolean> {
  if (namaRole === 'admin') return true

  const [role] = await db
    .select({ permissions: roles.permissions })
    .from(roles)
    .where(eq(roles.namaRole, namaRole))
    .limit(1)

  if (!role) return false
  const perms = role.permissions as string[] | null
  return perms ? perms.includes(permission) : false
}

/**
 * Mengambil semua hak akses (permissions) untuk role tertentu.
 */
export async function getRolePermissions(namaRole: string): Promise<string[]> {
  if (namaRole === 'admin') {
    return ['buat_laporan', 'verifikasi_laporan', 'rekap_laporan', 'lihat_statistik', 'kelola_master', 'kelola_pengguna', 'kelola_hak_akses']
  }

  const [role] = await db
    .select({ permissions: roles.permissions })
    .from(roles)
    .where(eq(roles.namaRole, namaRole))
    .limit(1)

  if (!role) return []
  return (role.permissions as string[]) || []
}
