import { Elysia } from 'elysia'
import { jwt } from '@elysiajs/jwt'

// Plugin tunggal JWT — Elysia akan mendeduplikasi berdasarkan name
// sehingga plugin ini aman diimport di banyak route file
export const jwtPlugin = new Elysia({ name: 'jwt-plugin' }).use(
  jwt({
    name: 'jwt',
    secret: Bun.env.JWT_SECRET ?? 'dp2kbp3a-super-secret-key-ganti-sebelum-deploy-2026',
    exp: '8h',
  })
)
