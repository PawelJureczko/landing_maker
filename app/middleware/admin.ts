// Chroni strony /admin/** poza login/2fa — wymaga pełnej sesji (mfa).
export default defineNuxtRouteMiddleware((to) => {
  if (to.path === '/admin/login' || to.path === '/admin/2fa') return
  const { session } = useUserSession()
  if (!(session.value as any)?.mfa) {
    return navigateTo('/admin/login')
  }
})
