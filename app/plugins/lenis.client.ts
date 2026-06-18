import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Smooth scroll (Lenis) wired into the GSAP ScrollTrigger ticker.
 * This is the single source of truth for scroll position — every
 * scroll-driven animation in the app reads from it.
 */
export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.server) return

  const prefersReduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches

  gsap.registerPlugin(ScrollTrigger)

  if (prefersReduced) {
    // No smooth scroll, but ScrollTrigger still drives reveals at full state.
    ScrollTrigger.refresh()
    return
  }

  const lenis = new Lenis({
    duration: 1.1,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.5,
  })

  lenis.on('scroll', ScrollTrigger.update)

  const tick = (time: number) => lenis.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)

  // Expose for components that want to scroll-to (e.g. nav links)
  nuxtApp.provide('lenis', lenis)

  nuxtApp.hook('page:finish', () => {
    lenis.scrollTo(0, { immediate: true })
    ScrollTrigger.refresh()
  })

  // Web fonts load async and reflow the layout — recompute every trigger's
  // start/end (and the horizontal-scroll distance) once they're ready.
  document.fonts?.ready.then(() => ScrollTrigger.refresh())

  // HMR: tear down the old instance so dev saves don't stack Lenis
  // instances / ticker callbacks fighting over the scroll position.
  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      ScrollTrigger.getAll().forEach((t) => t.kill())
    })
  }
})
