import { Elysia } from 'elysia'
import { jwtPlugin } from './jwt'
import type { UserPayload } from '../types'

// Plugin auth: mengekstrak user dari cookie session per-request.
// { as: 'scoped' } memastikan derived 'user' terlihat di route yang menggunakan plugin ini.
export const authPlugin = new Elysia({ name: 'auth-plugin' })
  .use(jwtPlugin)
  .derive({ as: 'scoped' }, async ({ jwt, cookie }) => {
    const rawToken = cookie['session']?.value
    const token = typeof rawToken === 'string' ? rawToken : ''
    if (!token) return { user: null as UserPayload | null }

    try {
      const payload = await jwt.verify(token)
      if (!payload) return { user: null as UserPayload | null }
      return { user: payload as unknown as UserPayload }
    } catch {
      return { user: null as UserPayload | null }
    }
  })
