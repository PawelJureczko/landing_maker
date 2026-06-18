import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

interface RevealOptions {
  y?: number
  duration?: number
  delay?: number
  stagger?: number
  start?: string
  /** select children to stagger instead of animating the element itself */
  childSelector?: string
  opacity?: boolean
}

/**
 * Reveal-on-scroll. Animates an element (or its children) into view the
 * first time it enters the viewport. Honours prefers-reduced-motion by
 * snapping straight to the resting state.
 */
export function useReveal(
  target: Ref<HTMLElement | null>,
  opts: RevealOptions = {},
) {
  const {
    y = 40,
    duration = 1,
    delay = 0,
    stagger = 0.08,
    start = 'top 85%',
    childSelector,
    opacity = true,
  } = opts

  let ctx: gsap.Context | null = null

  onMounted(() => {
    if (!target.value) return

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    const items = childSelector
      ? target.value.querySelectorAll(childSelector)
      : [target.value]

    if (reduced) {
      gsap.set(items, { opacity: 1, y: 0 })
      return
    }

    ctx = gsap.context(() => {
      gsap.from(items, {
        y,
        opacity: opacity ? 0 : 1,
        duration,
        delay,
        stagger,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: target.value,
          start,
          once: true,
        },
      })
    }, target.value)
  })

  onBeforeUnmount(() => {
    ctx?.revert()
    ScrollTrigger.getAll().forEach((t) => {
      if (t.trigger === target.value) t.kill()
    })
  })
}
