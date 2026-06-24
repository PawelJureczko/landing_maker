import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  modules: ['@vueuse/nuxt', 'nuxt-auth-utils'],

  runtimeConfig: {
    databaseUrl: '',
    leadNotifyTo: '',
    smtp: { host: '', port: '', from: '' },
  },

  routeRules: {
    '/': { prerender: true },
    '/polityka-prywatnosci': { prerender: true },
  },

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    head: {
      title: 'witrynovo.pl - strony internetowe dla lokalnych firm',
      htmlAttrs: { lang: 'pl' },
      script: [
        {
          // Runs before first paint: (1) marks JS available so CSS can
          // pre-hide animated hero content (no flash of the start state),
          // (2) applies the saved/system color theme (no light/dark flash).
          innerHTML:
            'document.documentElement.classList.add("js");try{var t=localStorage.getItem("witrynovo-theme");if(t==="dark"||((!t||t==="auto")&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}',
          tagPosition: 'head',
        },
      ],
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Tworzymy proste, dopracowane strony internetowe dla lokalnych firm - fryzjerów, mechaników, kwiaciarni i innych. Darmowy projekt, płacisz dopiero gdy Ci się spodoba.',
        },
        { name: 'theme-color', content: '#ffffff' },
        // Open Graph (Facebook, LinkedIn, Messenger…)
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'witrynovo.pl' },
        { property: 'og:locale', content: 'pl_PL' },
        { property: 'og:url', content: 'https://witrynovo.pl/' },
        {
          property: 'og:title',
          content: 'witrynovo.pl - strony internetowe dla lokalnych firm',
        },
        {
          property: 'og:description',
          content:
            'Darmowy projekt strony pod Twoją firmę. Płacisz dopiero, gdy Ci się spodoba.',
        },
        { property: 'og:image', content: 'https://witrynovo.pl/og.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        {
          property: 'og:image:alt',
          content: 'witrynovo.pl - strony internetowe dla lokalnych firm',
        },
        // Twitter / X
        { name: 'twitter:card', content: 'summary_large_image' },
        {
          name: 'twitter:title',
          content: 'witrynovo.pl - strony internetowe dla lokalnych firm',
        },
        {
          name: 'twitter:description',
          content:
            'Darmowy projekt strony pod Twoją firmę. Płacisz dopiero, gdy Ci się spodoba.',
        },
        { name: 'twitter:image', content: 'https://witrynovo.pl/og.png' },
      ],
      link: [
        { rel: 'canonical', href: 'https://witrynovo.pl/' },
        // favicons: .ico for legacy/auto-request, SVG for modern, PNG fallbacks
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700;14..32,800;14..32,900&family=Instrument+Serif:ital@0;1&display=swap',
        },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },
})
