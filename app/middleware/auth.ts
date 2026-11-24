export default defineNuxtRouteMiddleware(async (to) => {
  const { fetchSession, user, databaseConfigured } = useTaskoraSession()
  await fetchSession()

  // Selama database belum dikonfigurasi, pengguna tetap boleh mengakses halaman
  // agar tidak terjadi redirect loop — setiap halaman menampilkan panduan setup.
  if (!databaseConfigured.value) return

  if (!user.value) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
})
