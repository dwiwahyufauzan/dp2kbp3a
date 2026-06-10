// Nilai namaRole yang valid (sesuai data seed di tabel roles)
export type NamaRole = 'admin' | 'petugas' | 'kepala_bidang' | 'pimpinan'

export type StatusVerifikasi = 'Pending' | 'Disetujui' | 'Ditolak' | 'Revisi'

// Payload JWT yang disimpan di cookie session
export interface UserPayload {
  idUser: string
  namaLengkap: string
  email: string
  namaRole: string     // nilai dari roles.nama_role (contoh: 'admin', 'petugas')
  idBidang: string | null
  idLokasi: string | null
}
