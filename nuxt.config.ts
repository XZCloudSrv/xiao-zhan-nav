import { defineNuxtConfig } from 'nuxt/config'
import { fileURLToPath } from 'url'

export default defineNuxtConfig({
  compatibilityDate: '2025-12-18',
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-fonts'
  ],
  
  googleFonts: {
    families: {
      'Outfit': [400, 600, 700],
      'Noto+Sans+SC': [400, 500, 700],
      'Inter': [400, 500],
    },
    display: 'swap'
  },
  
  app: {
    head: {
      title: '小战の个人导航',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1' }
      ],
      bodyAttrs: {
        class: 'antialiased'
      }
    }
  },
  
  // 使用 Nuxt 的别名配置（可选）
  alias: {
    '@components': fileURLToPath(new URL('./components', import.meta.url)),
    '@stores': fileURLToPath(new URL('./stores', import.meta.url)),
  },
  
  nitro: {
    compressPublicAssets: true,
    prerender: {
      crawlLinks: false,
      routes: ['/']
    }
  },
  
  routeRules: {
    '/': { prerender: true },
    '/api/**': { cors: true }
  },
  
  typescript: {
    strict: true,
    typeCheck: true
  }
})
