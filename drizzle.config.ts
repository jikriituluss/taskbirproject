import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'drizzle-kit'

function buildSslConfig() {
  if (process.env.TIDB_SSL === 'false') {
    return undefined
  }

  const caPath = process.env.TIDB_SSL_CA_PATH
  if (caPath) {
    return {
      minVersion: 'TLSv1.2' as const,
      rejectUnauthorized: true,
      ca: readFileSync(caPath, 'utf-8')
    }
  }

  return {
    minVersion: 'TLSv1.2' as const,
    rejectUnauthorized: true
  }
}

function getDbCredentials() {
  if (process.env.DATABASE_URL) {
    const parsed = new URL(process.env.DATABASE_URL)
    return {
      host: parsed.hostname,
      port: Number(parsed.port || 4000),
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.replace(/^\//, ''),
      ssl: buildSslConfig()
    }
  }

  return {
    host: process.env.TIDB_HOST || '127.0.0.1',
    port: Number(process.env.TIDB_PORT || 4000),
    user: process.env.TIDB_USER || 'root',
    password: process.env.TIDB_PASSWORD || '',
    database: process.env.TIDB_DATABASE || 'taskora',
    ssl: buildSslConfig()
  }
}

export default defineConfig({
  dialect: 'mysql',
  schema: './server/database/schema/index.ts',
  out: './server/database/migrations',
  dbCredentials: getDbCredentials(),
  verbose: true,
  strict: true
})
