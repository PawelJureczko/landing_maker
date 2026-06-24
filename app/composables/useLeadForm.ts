import { reactive, ref, computed } from 'vue'

// Logika formularza kontaktowego (CtaSection): stan, walidacja i wysyłka leada.
// Wydzielona z komponentu, by dało się ją testować jednostkowo bez DOM-u.
// Lifecycle (onMounted) celowo zostaje w komponencie — tu wystawiamy
// markRendered(), które komponent wywołuje po zamontowaniu (anty-spam time-trap).
export function useLeadForm() {
  const form = reactive({
    imie: '',
    kontakt: '',
    branza: '',
    firma: '',
    wiadomosc: '',
    zgoda: false,
    website: '', // honeypot — ukryte, ludzie nie wypełniają
  })
  const submitted = ref(false)
  const tried = ref(false)
  const submitting = ref(false)
  const submitError = ref('')
  const serverErrors = reactive<Record<string, string>>({})

  const renderedAt = ref(0)
  function markRendered() {
    renderedAt.value = Date.now()
  }

  const valid = computed(
    () => form.imie.trim() && form.kontakt.trim() && form.branza && form.zgoda,
  )

  async function submit() {
    tried.value = true
    submitError.value = ''
    Object.keys(serverErrors).forEach((k) => delete serverErrors[k])
    if (!valid.value) return
    submitting.value = true
    try {
      await $fetch('/api/leads', {
        method: 'POST',
        body: {
          imie: form.imie,
          kontakt: form.kontakt,
          branza: form.branza,
          firma: form.firma,
          wiadomosc: form.wiadomosc,
          website: form.website,
          ts: renderedAt.value,
        },
      })
      submitted.value = true
    } catch (e: any) {
      if (e?.statusCode === 422 && e?.data?.errors) {
        Object.assign(serverErrors, e.data.errors)
      } else {
        submitError.value = 'Coś poszło nie tak. Spróbuj ponownie lub zadzwoń.'
      }
    } finally {
      submitting.value = false
    }
  }

  return {
    form,
    submitted,
    tried,
    submitting,
    submitError,
    serverErrors,
    valid,
    submit,
    markRendered,
  }
}
