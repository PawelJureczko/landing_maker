import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  modules: ['@vueuse/nuxt'],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    head: {
      title: '[TwojaMarka] — strony internetowe dla lokalnych firm',
      htmlAttrs: { lang: 'pl' },
      script: [
        {
          // Runs before first paint: (1) marks JS available so CSS can
          // pre-hide animated hero content (no flash of the start state),
          // (2) applies the saved/system color theme (no light/dark flash).
          innerHTML:
            'document.documentElement.classList.add("js");try{var t=localStorage.getItem("plume-theme");if(t==="dark"||((!t||t==="auto")&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}',
          tagPosition: 'head',
        },
      ],
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Tworzymy proste, dopracowane strony internetowe dla lokalnych firm — fryzjerów, mechaników, kwiaciarni i innych. Darmowy projekt, płacisz dopiero gdy Ci się spodoba.',
        },
        { name: 'theme-color', content: '#ffffff' },
      ],
      link: [
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
