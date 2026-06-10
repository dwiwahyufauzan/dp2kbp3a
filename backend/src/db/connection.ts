import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import * as schema from './schema'

const pool = mysql.createPool({
  host: Bun.env.DB_HOST ?? 'localhost',
  port: Number(Bun.env.DB_PORT ?? '3306'),
  user: Bun.env.DB_USER ?? 'root',
  password: Bun.env.DB_PASSWORD ?? '',
  database: Bun.env.DB_NAME ?? 'dp2kbp3a',
  waitForConnections: true,
  connectionLimit: 10,
  // Kembalikan kolom DATE sebagai string 'YYYY-MM-DD', bukan Date object
  dateStrings: ['DATE'],
})

export const db = drizzle(pool, { schema, mode: 'default' })
