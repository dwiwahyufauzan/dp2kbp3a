export type NamaRole = 'admin' | 'petugas' | 'kepala_bidang' | 'pimpinan'
export type StatusVerifikasi = 'Pending' | 'Disetujui' | 'Ditolak' | 'Revisi'

export interface UserPayload {
	idUser: string
	namaLengkap: string
	email: string
	namaRole: NamaRole
	idBidang: string | null
	idLokasi: string | null
}

export interface Role {
	idRole: string
	namaRole: string
}

export interface Bidang {
	idBidang: string
	namaBidang: string
	deskripsi: string | null
}

export interface LokasiTugas {
	idLokasi: string
	namaKecamatan: string
	namaDesa: string
}

export interface JenisKegiatan {
	idJenis: string
	idBidang: string | null
	namaBidang?: string | null
	namaKegiatan: string
}

export interface LaporanItem {
	idLaporan: string
	idUser: string
	namaLengkap: string | null
	idJenis: string
	namaKegiatan: string | null
	idBidang: string | null
	namaBidang: string | null
	tanggalKegiatan: string
	lokasiDetail: string
	jumlahPeserta: number
	jumlahLaki: number | null
	jumlahPerempuan: number | null
	deskripsiKegiatan: string
	statusVerifikasi: StatusVerifikasi
	catatanVerifikator: string | null
	idVerifikator: string | null
	createdAt: string
	updatedAt: string
	petugas: { namaLengkap: string } | null
	desa: { namaDesa: string } | null
	kecamatan: { namaKecamatan: string } | null
}

export interface DokumentasiLaporan {
	idDokumentasi: string
	idLaporan: string
	filePath: string
	tipeFile: string | null
	namaAsli: string | null
}

export interface RiwayatRevisi {
	idRiwayat: string
	idLaporan: string
	idUser: string | null
	namaUser: string | null
	tipeAksi: string
	statusSebelum: string | null
	statusSesudah: string | null
	dataLama: Record<string, unknown> | null
	catatan: string | null
	createdAt: string
}

export interface LaporanDetail extends LaporanItem {
	dokumentasi: DokumentasiLaporan[]
	riwayatRevisi: RiwayatRevisi[]
}

export interface Pengguna {
	idUser: string
	namaLengkap: string
	email: string
	namaRole: string
	idRole: string
	idBidang: string | null
	namaBidang: string | null
	idLokasi: string | null
	statusAktif: 'y' | 'n'
	createdAt: string
}
