import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import * as schema from './schema'

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

export function useDb() {
  if (_db) return _db
  const { databaseUrl } = useRuntimeConfig()
  const pool = mysql.createPool(databaseUrl)
  _db = drizzle(pool, { schema, mode: 'default' })
  return _db
}
