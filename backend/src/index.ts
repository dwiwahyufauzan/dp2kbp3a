import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { join } from 'node:path'
import { mkdirSync } from 'node:fs'
import { jwtPlugin } from './plugins/jwt'
import { authRoutes } from './routes/auth'
import { laporanRoutes } from './routes/laporan'
import { rekapRoutes } from './routes/rekap'
import { statistikRoutes } from './routes/statistik'
import { masterKegiatanRoutes } from './routes/master-kegiatan'
import { logAktivitasRoutes } from './routes/log-aktivitas'
import { adminPenggunaRoutes } from './routes/admin/pengguna'
import { adminUnitKerjaRoutes } from './routes/admin/unit-kerja'
import { adminLokasiTugasRoutes } from './routes/admin/lokasi-tugas'
import { adminHakAksesRoutes } from './routes/admin/hak-akses'
import { profilRoutes } from './routes/profil'
import { verifikasiRoutes } from './routes/verifikasi'
import { notifikasiRoutes } from './routes/notifikasi'
import { sanitizeObject } from './utils/sanitizer'

// Pastikan direktori uploads tersedia
const UPLOAD_DIR = Bun.env.UPLOAD_DIR || join(import.meta.dir, '../uploads')
mkdirSync(UPLOAD_DIR, { recursive: true })

const app = new Elysia()
  .use(
    cors({
      origin: Bun.env.FRONTEND_URL ?? 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type'],
    })
  )
  .onBeforeHandle((ctx) => {
    // Set Security Headers
    ctx.set.headers['X-Content-Type-Options'] = 'nosniff'
    ctx.set.headers['X-Frame-Options'] = 'DENY'
    ctx.set.headers['X-XSS-Protection'] = '1; mode=block'
    ctx.set.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'

    // Sanitize Request Body
    if (ctx.body && typeof ctx.body === 'object') {
      ctx.body = sanitizeObject(ctx.body)
    }
  })
  .use(jwtPlugin)

  // Health check
  .get('/health', () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'DP2KBP3A API',
  }))

  // Static: sajikan file upload (gambar, PDF, ZIP, Word, Excel, dll)
  .get('/uploads/:file', async ({ params, set }) => {
    // Sanitasi nama file — izinkan UUID pattern + ekstensi umum
    const filename = params.file.replace(/[^a-zA-Z0-9._-]/g, '')
    if (!filename || filename !== params.file) {
      set.status = 404
      return { message: 'File tidak ditemukan' }
    }
    const f = Bun.file(join(UPLOAD_DIR, filename))
    if (!(await f.exists())) {
      set.status = 404
      return { message: 'File tidak ditemukan' }
    }

    // Set Content-Disposition untuk tipe file non-gambar (force download)
    const ext = filename.split('.').pop()?.toLowerCase() ?? ''
    const downloadTypes = ['zip', 'docx', 'xlsx', 'doc', 'xls']
    if (downloadTypes.includes(ext)) {
      set.headers = {
        'Content-Disposition': `attachment; filename="${filename}"`,
      }
    }

    return f
  })

  // Routes
  .use(authRoutes)
  .use(masterKegiatanRoutes)
  .use(laporanRoutes)
  .use(rekapRoutes)
  .use(statistikRoutes)
  .use(logAktivitasRoutes)
  .use(adminPenggunaRoutes)
  .use(adminUnitKerjaRoutes)
  .use(adminLokasiTugasRoutes)
  .use(adminHakAksesRoutes)
  .use(profilRoutes)
  .use(verifikasiRoutes)
  .use(notifikasiRoutes)

  // Global error handler
  .onError(({ code, error, set }) => {
    if (code === 'VALIDATION') {
      set.status = 422
      return { message: 'Data tidak valid', detail: error.message }
    }
    if (code === 'NOT_FOUND') {
      set.status = 404
      return { message: 'Endpoint tidak ditemukan' }
    }
    console.error('[Error]', error)
    set.status = 500
    return { message: 'Terjadi kesalahan pada server' }
  })

  .listen(Bun.env.PORT ?? 3000)

console.log(`API DP2KBP3A berjalan di http://localhost:${app.server?.port}`)
console.log(`Health check: http://localhost:${app.server?.port}/health`)

export type App = typeof app
