import { checkDatabaseConnection, isDatabaseConfigured } from '../database'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const shouldPingDb = query.db === 'true'
  const configured = isDatabaseConfigured()

  let connected: boolean | null = null
  let dbError: string | undefined

  if (shouldPingDb && configured) {
    const result = await checkDatabaseConnection()
    connected = result.ok
    dbError = result.error
  }

  return {
    status: 'ok',
    app: 'Taskora',
    stage: 1,
    timestamp: new Date().toISOString(),
    database: {
      dialect: 'tidb-mysql',
      configured,
      connected,
      ...(dbError ? { error: dbError } : {})
    }
  }
})
