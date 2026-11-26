// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxt/ui'],

  ui: {
    fonts: false,
    colorMode: false
  },

  css: ['~/assets/css/main.css'],

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
    head: {
      title: 'Taskbir - Project & Task Management',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ],
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Taskbir adalah aplikasi manajemen proyek dan tugas modern untuk freelancer, agensi, dan tim kecil.'
        }
      ]
    }
  },

  runtimeConfig: {
    sessionSecret: process.env.NUXT_SESSION_SECRET || '',
    databaseUrl: process.env.DATABASE_URL || '',
    tidbHost: process.env.TIDB_HOST || '127.0.0.1',
    tidbPort: process.env.TIDB_PORT || '4000',
    tidbUser: process.env.TIDB_USER || 'root',
    tidbPassword: process.env.TIDB_PASSWORD || '',
    tidbDatabase: process.env.TIDB_DATABASE || 'taskora',
    tidbSsl: process.env.TIDB_SSL || 'true',
    tidbSslCaPath: process.env.TIDB_SSL_CA_PATH || '',
    public: {
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'Taskbir',
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000'
    }
  },

  typescript: {
    strict: true,
    typeCheck: false
  }
})
