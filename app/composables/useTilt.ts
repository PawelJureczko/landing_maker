import gsap from 'gsap'

/**
 * 3D tilt on pointer move. The element rotates toward the cursor in
 * perspective space and lifts slightly, then eases back on leave.
 */
export function useTilt(target: Ref<HTMLElement | null>, max = 12) {
  let rotX: gsap.QuickToFunc | null = null
  let rotY: gsap.QuickToFunc | null = null
  let lift: gsap.QuickToFunc | null = null

  const onMove = (e: MouseEvent) => {
    const el = target.value
    if (!el || !rotX || !rotY) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    rotY(px * max)
    rotX(-py * max)
  }

  const onEnter = () => lift?.(-8)
  const onLeave = () => {
    rotX?.(0)
    rotY?.(0)
    lift?.(0)
  }

  onMounted(() => {
    const el = target.value
    if (!el) return
    if (window.matchMedia('(pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    gsap.set(el, { transformPerspective: 900, transformStyle: 'preserve-3d' })
    rotX = gsap.quickTo(el, 'rotationX', { duration: 0.4, ease: 'power3.out' })
    rotY = gsap.quickTo(el, 'rotationY', { duration: 0.4, ease: 'power3.out' })
    lift = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' })

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseenter', onEnter)
    el.addEventListener('mouseleave', onLeave)
  })

  onBeforeUnmount(() => {
    const el = target.value
    if (!el) return
    el.removeEventListener('mousemove', onMove)
    el.removeEventListener('mouseenter', onEnter)
    el.removeEventListener('mouseleave', onLeave)
  })
}
