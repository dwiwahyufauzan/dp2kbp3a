import { Elysia } from 'elysia'
import { jwt } from '@elysiajs/jwt'

// Plugin tunggal JWT — Elysia akan mendeduplikasi berdasarkan name
// sehingga plugin ini aman diimport di banyak route file
export const jwtPlugin = new Elysia({ name: 'jwt-plugin' }).use(
  jwt({
    name: 'jwt',
    secret: Bun.env.JWT_SECRET ?? 'change-this-secret-in-production-min-32-chars',
    exp: '8h',
  })
)
