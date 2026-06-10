/**
 * Seed Script — Data awal: roles, bidang, jenis_kegiatan per bidang, dan akun admin
 * Jalankan: bun run seed
 */
import { db } from './db/connection'
import { roles, bidang, jenisKegiatan, users } from './db/schema'
import { eq } from 'drizzle-orm'

const ADMIN_EMAIL = 'admin@dp2kbp3a.go.id'
const ADMIN_PASSWORD = 'Admin@1234'

async function seed() {
  console.log('Memulai proses seeding...')

  // ─── Roles ───────────────────────────────────────────────────────────────
  const rolesData = [
    { namaRole: 'admin' },
    { namaRole: 'petugas' },
    { namaRole: 'kepala_bidang' },
    { namaRole: 'pimpinan' },
  ]

  const roleMap: Record<string, string> = {}

  for (const r of rolesData) {
    const [existing] = await db
      .select({ idRole: roles.idRole, namaRole: roles.namaRole })
      .from(roles)
      .where(eq(roles.namaRole, r.namaRole))
      .limit(1)

    if (!existing) {
      const idRole = crypto.randomUUID()
      await db.insert(roles).values({ idRole, namaRole: r.namaRole })
      roleMap[r.namaRole] = idRole
      console.log(`  Role ditambahkan: ${r.namaRole}`)
    } else {
      roleMap[r.namaRole] = existing.idRole
      console.log(`  Role sudah ada: ${r.namaRole}`)
    }
  }

  // ─── Bidang ──────────────────────────────────────────────────────────────
  const bidangData = [
    { namaBidang: 'Bidang Pengendalian Penduduk', deskripsi: 'Menangani program pengendalian pertumbuhan penduduk' },
    { namaBidang: 'Bidang Keluarga Berencana', deskripsi: 'Menangani program Keluarga Berencana dan kontrasepsi' },
    { namaBidang: 'Bidang Pemberdayaan Perempuan', deskripsi: 'Menangani program pemberdayaan dan perlindungan perempuan' },
    { namaBidang: 'Bidang Perlindungan Anak', deskripsi: 'Menangani program perlindungan dan pengembangan anak' },
  ]

  const bidangMap: Record<string, string> = {}

  for (const b of bidangData) {
    const [existing] = await db
      .select({ idBidang: bidang.idBidang })
      .from(bidang)
      .where(eq(bidang.namaBidang, b.namaBidang))
      .limit(1)

    if (!existing) {
      const idBidang = crypto.randomUUID()
      await db.insert(bidang).values({ idBidang, ...b })
      bidangMap[b.namaBidang] = idBidang
      console.log(`  Bidang ditambahkan: ${b.namaBidang}`)
    } else {
      bidangMap[b.namaBidang] = existing.idBidang
      console.log(`  Bidang sudah ada: ${b.namaBidang}`)
    }
  }

  // ─── Jenis Kegiatan per Bidang ────────────────────────────────────────────
  const kegiatanPerBidang: { namaBidang: string; kegiatan: string[] }[] = [
    {
      namaBidang: 'Bidang Pengendalian Penduduk',
      kegiatan: [
        'Penyuluhan Kependudukan',
        'Pendataan Keluarga',
        'Sosialisasi Program KKBPK',
        'Pembinaan Kelompok Kerja',
        'Pengumpulan Data Demografi',
        'Analisis Laju Pertumbuhan Penduduk',
        'Koordinasi Lintas Sektor Kependudukan',
      ],
    },
    {
      namaBidang: 'Bidang Keluarga Berencana',
      kegiatan: [
        'Penyuluhan KB',
        'Distribusi Alat Kontrasepsi',
        'Pelayanan KB Mobile',
        'Pendampingan Akseptor KB Baru',
        'Konseling KB',
        'Monitoring Peserta KB Aktif',
        'Pembentukan Kelompok KB Pria',
        'Pendampingan Stunting',
      ],
    },
    {
      namaBidang: 'Bidang Pemberdayaan Perempuan',
      kegiatan: [
        'Pelatihan Keterampilan Perempuan',
        'Sosialisasi Pengarusutamaan Gender',
        'Pembinaan Organisasi Wanita',
        'Pendampingan Korban KDRT',
        'Peningkatan Kapasitas Perempuan',
        'Penyuluhan Hak-Hak Perempuan',
        'Pemberdayaan Ekonomi Perempuan',
      ],
    },
    {
      namaBidang: 'Bidang Perlindungan Anak',
      kegiatan: [
        'Sosialisasi Perlindungan Anak',
        'Penanganan Kasus Anak',
        'Pembentukan Forum Anak',
        'Pengembangan Kota Layak Anak',
        'Pendampingan Anak Rentan',
        'Pelatihan Parenting',
        'Monitoring Tumbuh Kembang Anak',
        'Pencegahan Kekerasan pada Anak',
      ],
    },
  ]

  for (const grup of kegiatanPerBidang) {
    const idBidang = bidangMap[grup.namaBidang]
    if (!idBidang) {
      console.error(`  ERROR: Bidang tidak ditemukan: ${grup.namaBidang}`)
      continue
    }
    for (const namaKegiatan of grup.kegiatan) {
      const [existing] = await db
        .select({ idJenis: jenisKegiatan.idJenis })
        .from(jenisKegiatan)
        .where(eq(jenisKegiatan.namaKegiatan, namaKegiatan))
        .limit(1)

      if (!existing) {
        await db.insert(jenisKegiatan).values({
          idJenis: crypto.randomUUID(),
          idBidang,
          namaKegiatan,
        })
        console.log(`  Kegiatan ditambahkan [${grup.namaBidang}]: ${namaKegiatan}`)
      } else {
        console.log(`  Kegiatan sudah ada: ${namaKegiatan}`)
      }
    }
  }

  // ─── Admin Utama ──────────────────────────────────────────────────────────
  const adminRoleId = roleMap['admin']
  if (!adminRoleId) {
    console.error('  ERROR: Role admin tidak ditemukan!')
    process.exit(1)
  }

  const [existingAdmin] = await db
    .select({ idUser: users.idUser })
    .from(users)
    .where(eq(users.email, ADMIN_EMAIL))
    .limit(1)

  if (!existingAdmin) {
    const password = await Bun.password.hash(ADMIN_PASSWORD)
    await db.insert(users).values({
      idUser: crypto.randomUUID(),
      namaLengkap: 'Administrator',
      email: ADMIN_EMAIL,
      password,
      idRole: adminRoleId,
      idBidang: null,
      idLokasi: null,
      statusAktif: 'y',
    })
    console.log(`\n  Admin dibuat:`)
    console.log(`    Email    : ${ADMIN_EMAIL}`)
    console.log(`    Password : ${ADMIN_PASSWORD}`)
    console.log(`\n  PENTING: Segera ganti password setelah login pertama!`)
  } else {
    console.log(`  Admin sudah ada: ${ADMIN_EMAIL}`)
  }

  console.log('\nSeeding selesai.')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seeding gagal:', err)
  process.exit(1)
})
