import gsap from 'gsap'

/**
 * Magnetic hover — the element drifts toward the cursor while hovered,
 * then springs back on leave. Great for primary CTAs.
 */
export function useMagnetic(
  target: Ref<HTMLElement | null>,
  strength = 0.4,
) {
  let quickX: gsap.QuickToFunc | null = null
  let quickY: gsap.QuickToFunc | null = null

  const onMove = (e: MouseEvent) => {
    const el = target.value
    if (!el || !quickX || !quickY) return
    const rect = el.getBoundingClientRect()
    const relX = e.clientX - (rect.left + rect.width / 2)
    const relY = e.clientY - (rect.top + rect.height / 2)
    quickX(relX * strength)
    quickY(relY * strength)
  }

  const onLeave = () => {
    quickX?.(0)
    quickY?.(0)
  }

  onMounted(() => {
    const el = target.value
    if (!el) return
    if (window.matchMedia('(pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    quickX = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'elastic.out(1, 0.4)' })
    quickY = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'elastic.out(1, 0.4)' })

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
  })

  onBeforeUnmount(() => {
    const el = target.value
    if (!el) return
    el.removeEventListener('mousemove', onMove)
    el.removeEventListener('mouseleave', onLeave)
  })
}
