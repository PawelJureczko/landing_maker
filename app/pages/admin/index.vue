<script setup lang="ts">
import type { Lead } from '../../../server/database/schema'
import { LEAD_STATUSES } from '../../../server/database/schema'
definePageMeta({ layout: 'admin', middleware: 'admin' })

const status = ref('')
const q = ref('')
const STATUSY = LEAD_STATUSES

const { data, refresh } = await useFetch<{ leads: Lead[] }>('/api/admin/leads', {
  query: { status, q },
})
</script>

<template>
  <main class="mx-auto max-w-5xl px-6 py-10">
    <h1 class="display text-2xl">Leady</h1>

    <div class="mt-6 flex flex-wrap gap-3">
      <select v-model="status" class="rounded-lg border border-line bg-white/5 px-3 py-2 text-sm" @change="refresh()">
        <option value="">Wszystkie statusy</option>
        <option v-for="s in STATUSY" :key="s" :value="s">{{ s }}</option>
      </select>
      <input v-model="q" placeholder="Szukaj (imię / kontakt)" class="rounded-lg border border-line bg-white/5 px-3 py-2 text-sm"
        @keyup.enter="refresh()" />
    </div>

    <table class="mt-6 w-full text-left text-sm">
      <thead class="text-fg/50">
        <tr><th class="py-2">Imię</th><th>Kontakt</th><th>Branża</th><th>Status</th><th></th></tr>
      </thead>
      <tbody>
        <tr v-for="l in data?.leads ?? []" :key="l.id" class="border-t border-line">
          <td class="py-2">{{ l.imie }}</td>
          <td>{{ l.kontakt }}</td>
          <td>{{ l.branza }}</td>
          <td>{{ l.status }}</td>
          <td><NuxtLink :to="`/admin/leads/${l.id}`" class="text-brand-2 underline">otwórz</NuxtLink></td>
        </tr>
        <tr v-if="!(data?.leads?.length)"><td colspan="5" class="py-6 text-center text-fg/50">Brak leadów.</td></tr>
      </tbody>
    </table>
  </main>
</template>
