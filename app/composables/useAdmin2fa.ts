import { ref } from 'vue'

export function useAdmin2fa() {
  const code = ref('')
  const error = ref('')
  const loading = ref(false)
  const qrUrl = ref('') // otpauth:// URL do wyrenderowania jako QR
  const secret = ref('')
  const needsEnroll = ref(false)

  async function loadState() {
    const res = await $fetch<{ needsEnroll: boolean }>('/api/auth/2fa/state')
    needsEnroll.value = res.needsEnroll
  }

  async function startEnroll() {
    const res = await $fetch<{ otpauthUrl: string; secret: string }>('/api/auth/2fa/setup', {
      method: 'POST',
    })
    qrUrl.value = res.otpauthUrl
    secret.value = res.secret
  }

  async function verify() {
    error.value = ''
    loading.value = true
    try {
      await $fetch('/api/auth/2fa/verify', { method: 'POST', body: { code: code.value } })
      return true
    } catch (e: any) {
      error.value = e?.data?.error ?? 'Nieprawidłowy kod.'
      return false
    } finally {
      loading.value = false
    }
  }

  return { code, error, loading, qrUrl, secret, needsEnroll, loadState, startEnroll, verify }
}
