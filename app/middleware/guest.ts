export default defineNuxtRouteMiddleware(async (to) => {
  const { fetchSession, user, databaseConfigured } = useTaskoraSession()
  await fetchSession()

  if (!databaseConfigured.value || !user.value) return

  const redirect = typeof to.query.redirect === 'string' ? to.query.redirect : '/dashboard'
  // Hanya izinkan path internal untuk mencegah open redirect.
  const target = redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/dashboard'
  return navigateTo(target)
})
