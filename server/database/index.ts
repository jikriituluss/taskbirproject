import { readFileSync } from 'node:fs'
import mysql, { type Pool, type PoolOptions } from 'mysql2/promise'
import { drizzle, type MySql2Database } from 'drizzle-orm/mysql2'
import * as schema from './schema'

export type TaskoraDatabase = MySql2Database<typeof schema>

let poolInstance: Pool | null = null
let dbInstance: TaskoraDatabase | null = null

function resolveSslOptions(sslFlag: string, caPath: string): PoolOptions['ssl'] {
  if (sslFlag === 'false') {
    return undefined
  }

  if (caPath) {
    return {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true,
      ca: readFileSync(caPath, 'utf-8')
    }
  }

  return {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  }
}

function getPoolOptions(): PoolOptions {
  const config = useRuntimeConfig()
  const ssl = resolveSslOptions(config.tidbSsl, config.tidbSslCaPath)

  if (config.databaseUrl) {
    const parsed = new URL(config.databaseUrl)
    return {
      host: parsed.hostname,
      port: Number(parsed.port || 4000),
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.replace(/^\//, ''),
      ssl,
      waitForConnections: true,
      connectionLimit: 10,
      maxIdle: 5,
      idleTimeout: 60000,
      enableKeepAlive: true
    }
  }

  return {
    host: config.tidbHost,
    port: Number(config.tidbPort || 4000),
    user: config.tidbUser,
    password: config.tidbPassword,
    database: config.tidbDatabase,
    ssl,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 5,
    idleTimeout: 60000,
    enableKeepAlive: true
  }
}

export function isDatabaseConfigured(): boolean {
  // runtimeConfig selalu punya nilai default, jadi deteksi harus berbasis
  // environment variable eksplisit agar tidak dianggap "siap" tanpa .env.
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL || process.env.NUXT_DATABASE_URL)
  const hasExplicitTidb = Boolean(
    (process.env.TIDB_HOST || process.env.NUXT_TIDB_HOST) &&
      (process.env.TIDB_USER || process.env.NUXT_TIDB_USER) &&
      (process.env.TIDB_DATABASE || process.env.NUXT_TIDB_DATABASE)
  )
  return hasDatabaseUrl || hasExplicitTidb
}

export function getDbPool(): Pool {
  if (!poolInstance) {
    poolInstance = mysql.createPool(getPoolOptions())
  }
  return poolInstance
}

export function useDb(): TaskoraDatabase {
  if (!dbInstance) {
    dbInstance = drizzle(getDbPool(), { schema, mode: 'default' })
  }
  return dbInstance
}

export async function checkDatabaseConnection(): Promise<{ ok: boolean; error?: string }> {
  try {
    const pool = getDbPool()
    await pool.query('SELECT 1')
    return { ok: true }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown database error'
    }
  }
}

export { schema }
