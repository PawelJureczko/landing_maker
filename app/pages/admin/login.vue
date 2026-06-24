<script setup lang="ts">
definePageMeta({ layout: 'admin' })
const { form, error, loading, submit } = useAdminLogin()

async function onSubmit() {
  const step = await submit()
  if (step) await navigateTo('/admin/2fa')
}
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
    <h1 class="display text-2xl">Panel witrynovo.pl</h1>
    <p class="mt-1 text-sm text-fg/60">Zaloguj się, aby zarządzać leadami.</p>
    <form class="mt-8 space-y-4" @submit.prevent="onSubmit">
      <div>
        <label for="l-email" class="mb-1 block text-sm text-fg/70">Email</label>
        <input id="l-email" v-model="form.email" type="email" autocomplete="username"
          class="w-full rounded-xl border border-line bg-white/5 px-4 py-3 outline-none focus-visible:border-brand" />
      </div>
      <div>
        <label for="l-pass" class="mb-1 block text-sm text-fg/70">Hasło</label>
        <input id="l-pass" v-model="form.password" type="password" autocomplete="current-password"
          class="w-full rounded-xl border border-line bg-white/5 px-4 py-3 outline-none focus-visible:border-brand" />
      </div>
      <p v-if="error" class="text-sm text-red-400">{{ error }}</p>
      <button type="submit" :disabled="loading"
        class="w-full rounded-full bg-gradient-to-r from-brand via-brand-2 to-brand-3 py-3 text-sm font-semibold text-white disabled:opacity-60">
        {{ loading ? 'Logowanie…' : 'Zaloguj' }}
      </button>
    </form>
  </main>
</template>
