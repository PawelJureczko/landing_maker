import { reactive, ref } from 'vue'

export function useAdminLogin() {
  const form = reactive({ email: '', password: '' })
  const error = ref('')
  const loading = ref(false)
  const nextStep = ref<'enroll' | 'verify' | ''>('')

  async function submit() {
    error.value = ''
    loading.value = true
    try {
      const res = await $fetch<{ ok: boolean; nextStep?: 'enroll' | 'verify' }>(
        '/api/auth/login',
        { method: 'POST', body: { email: form.email, password: form.password } },
      )
      nextStep.value = res.nextStep ?? 'verify'
    } catch (e: any) {
      error.value = e?.data?.error ?? 'Coś poszło nie tak. Spróbuj ponownie.'
    } finally {
      loading.value = false
    }
    return nextStep.value
  }

  return { form, error, loading, nextStep, submit }
}
