/**
 * Smooth-scroll to an in-page anchor. Uses Lenis when available (desktop,
 * motion allowed) and falls back to native scrollIntoView with a header
 * offset everywhere else. Safe to call from any click handler.
 */
export function useScrollTo() {
  const nuxtApp = useNuxtApp() as unknown as {
    $lenis?: { scrollTo: (t: string | number, o?: object) => void }
  }

  return (href: string, offset = -80) => {
    if (import.meta.server) return
    if (nuxtApp.$lenis) {
      nuxtApp.$lenis.scrollTo(href, { offset, duration: 1.4 })
      return
    }
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
