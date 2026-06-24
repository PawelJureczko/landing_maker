<script setup lang="ts">
useHead({ title: 'Polityka prywatności - witrynovo.pl' })
</script>

<template>
  <main class="mx-auto max-w-2xl px-6 py-24 text-fg">
    <h1 class="display text-3xl md:text-4xl">Polityka prywatności</h1>
    <div class="mt-8 space-y-4 text-fg/80">
      <p>
        Administratorem danych podanych w formularzu jest witrynovo.pl. Dane
        (imię, telefon lub e-mail, branża, nazwa firmy oraz treść wiadomości)
        przetwarzamy wyłącznie w celu przygotowania darmowego projektu strony
        i kontaktu w tej sprawie.
      </p>
      <p>
        Danych nie przekazujemy podmiotom trzecim w celach marketingowych.
        Masz prawo wglądu, poprawienia oraz usunięcia swoich danych - napisz na
        <a href="mailto:kontakt@witrynovo.pl" class="text-brand-2 underline">kontakt@witrynovo.pl</a>.
      </p>
      <p>
        Dane przechowujemy tak długo, jak to potrzebne do obsługi zgłoszenia,
        a następnie je usuwamy.
      </p>
    </div>
    <NuxtLink to="/" class="mt-10 inline-block text-sm text-brand-2 underline">
      &larr; Wróć na stronę główną
    </NuxtLink>
  </main>
</template>
