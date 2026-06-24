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
      // Brak nextStep przy sukcesie nie powinien się zdarzyć (kontrakt serwera);
      // gdyby się zdarzył, zostaw '' — strona nie nawiguje (bezpieczny no-op) zamiast
      // zgadywać 'verify' i wysłać usera w złą stronę.
      nextStep.value = res.nextStep ?? ''
    } catch (e: any) {
      error.value = e?.data?.error ?? 'Coś poszło nie tak. Spróbuj ponownie.'
    } finally {
      loading.value = false
    }
    return nextStep.value
  }

  return { form, error, loading, nextStep, submit }
}
