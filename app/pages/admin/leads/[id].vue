<script setup lang="ts">
import type { Lead, LeadNote } from '../../../../server/database/schema'
definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const STATUSY = ['new', 'contacted', 'project_sent', 'revisions', 'won', 'lost']
const { data, refresh } = await useFetch<{ lead: Lead; notes: LeadNote[] }>(
  `/api/admin/leads/${route.params.id}`,
)

const noteBody = ref('')

async function setStatus(status: string) {
  await $fetch(`/api/admin/leads/${route.params.id}`, { method: 'PATCH', body: { status } })
  await refresh()
}
async function addNote() {
  if (!noteBody.value.trim()) return
  await $fetch(`/api/admin/leads/${route.params.id}/notes`, {
    method: 'POST',
    body: { body: noteBody.value },
  })
  noteBody.value = ''
  await refresh()
}
</script>

<template>
  <main v-if="data" class="mx-auto max-w-3xl px-6 py-10">
    <NuxtLink to="/admin" class="text-sm text-brand-2 underline">&larr; Wszystkie leady</NuxtLink>
    <h1 class="display mt-3 text-2xl">{{ data.lead.imie }}</h1>
    <dl class="mt-4 space-y-1 text-sm text-fg/80">
      <div><span class="text-fg/50">Kontakt:</span> {{ data.lead.kontakt }}</div>
      <div><span class="text-fg/50">Branża:</span> {{ data.lead.branza }}</div>
      <div v-if="data.lead.firma"><span class="text-fg/50">Firma:</span> {{ data.lead.firma }}</div>
      <div v-if="data.lead.wiadomosc"><span class="text-fg/50">Wiadomość:</span> {{ data.lead.wiadomosc }}</div>
    </dl>

    <div class="mt-6">
      <label class="mb-1 block text-sm text-fg/50">Status</label>
      <select :value="data.lead.status" class="rounded-lg border border-line bg-white/5 px-3 py-2 text-sm"
        @change="setStatus(($event.target as HTMLSelectElement).value)">
        <option v-for="s in STATUSY" :key="s" :value="s">{{ s }}</option>
      </select>
    </div>

    <section class="mt-8">
      <h2 class="text-lg font-semibold">Notatki</h2>
      <form class="mt-3 flex gap-2" @submit.prevent="addNote">
        <input v-model="noteBody" placeholder="Dopisz notatkę…"
          class="flex-1 rounded-lg border border-line bg-white/5 px-3 py-2 text-sm" />
        <button class="rounded-lg bg-brand px-4 text-sm font-semibold text-white">Dodaj</button>
      </form>
      <ul class="mt-4 space-y-3">
        <li v-for="n in data.notes" :key="n.id" class="rounded-lg border border-line p-3 text-sm">
          <p>{{ n.body }}</p>
          <p class="mt-1 text-xs text-fg/40">{{ new Date(n.createdAt).toLocaleString('pl-PL') }}</p>
        </li>
        <li v-if="!data.notes.length" class="text-sm text-fg/50">Brak notatek.</li>
      </ul>
    </section>
  </main>
</template>
