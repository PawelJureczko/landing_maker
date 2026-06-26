<script setup lang="ts">
// Shell panelu admina: pasek marki + nawigacja + wyloguj. Używany przez
// zalogowane strony (/admin, /admin/leads/[id]). Logowanie/2FA mają layout 'auth'.
const { clear } = useUserSession()
const route = useRoute()

const nav = [{ label: 'Leady', to: '/admin' }]
// Sekcje Warstwy 3 — pokazane jako "wkrótce", żeby było widać kierunek panelu.
const soon = ['Klienci', 'Projekty', 'Abonamenty']

function isActive(to: string) {
  return route.path === to || route.path.startsWith('/admin/leads')
}

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  await navigateTo('/admin/login')
}
</script>

<template>
  <div class="min-h-screen bg-bg text-fg">
    <header class="border-b border-line">
      <div class="mx-auto flex max-w-5xl items-center gap-6 px-6 py-3">
        <NuxtLink to="/admin" class="font-bold tracking-tight">
          witrynovo<span class="text-brand-2">.pl</span>
        </NuxtLink>

        <nav class="flex items-center gap-1 text-sm">
          <NuxtLink
            v-for="item in nav"
            :key="item.to"
            :to="item.to"
            class="rounded-lg px-3 py-1.5 transition-colors"
            :class="isActive(item.to) ? 'bg-white/10 text-fg' : 'text-fg/60 hover:text-fg'"
          >
            {{ item.label }}
          </NuxtLink>
          <span
            v-for="label in soon"
            :key="label"
            class="cursor-default rounded-lg px-3 py-1.5 text-fg/30"
            title="Wkrótce (Warstwa 3)"
          >
            {{ label }}
          </span>
        </nav>

        <button class="ml-auto text-sm text-fg/60 underline hover:text-fg" @click="logout">
          Wyloguj
        </button>
      </div>
    </header>

    <slot />
  </div>
</template>
