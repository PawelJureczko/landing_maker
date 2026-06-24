<script setup lang="ts">
import QRCode from 'qrcode'
definePageMeta({ layout: 'admin' })

const { code, error, loading, qrUrl, secret, needsEnroll, loadState, startEnroll, verify } = useAdmin2fa()
const qrImg = ref('')

onMounted(async () => {
  await loadState()
})

async function beginEnroll() {
  await startEnroll()
  qrImg.value = await QRCode.toDataURL(qrUrl.value)
}

async function onVerify() {
  if (await verify()) await navigateTo('/admin')
}
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
    <h1 class="display text-2xl">Weryfikacja dwuetapowa</h1>

    <div v-if="needsEnroll && !qrImg" class="mt-6">
      <p class="text-sm text-fg/70">
        Pierwsze logowanie — skonfiguruj aplikację authenticator.
      </p>
      <button class="mt-4 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white"
        @click="beginEnroll">
        Pokaż kod QR
      </button>
    </div>

    <div v-else-if="needsEnroll && qrImg" class="mt-6">
      <p class="text-sm text-fg/70">Zeskanuj w aplikacji (Google Authenticator / Aegis):</p>
      <img :src="qrImg" alt="Kod QR 2FA" class="mt-3 h-44 w-44 rounded-xl bg-white p-2" />
      <p class="mt-2 break-all text-xs text-fg/50">Sekret: {{ secret }}</p>
    </div>

    <p v-else class="mt-6 text-sm text-fg/70">Podaj kod z aplikacji authenticator.</p>

    <form class="mt-6 space-y-4" @submit.prevent="onVerify">
      <input v-model="code" inputmode="numeric" autocomplete="one-time-code" placeholder="123456"
        class="w-full rounded-xl border border-line bg-white/5 px-4 py-3 text-center tracking-widest outline-none focus-visible:border-brand" />
      <p v-if="error" class="text-sm text-red-400">{{ error }}</p>
      <button type="submit" :disabled="loading"
        class="w-full rounded-full bg-gradient-to-r from-brand via-brand-2 to-brand-3 py-3 text-sm font-semibold text-white disabled:opacity-60">
        {{ loading ? 'Sprawdzam…' : 'Potwierdź' }}
      </button>
    </form>
  </main>
</template>
