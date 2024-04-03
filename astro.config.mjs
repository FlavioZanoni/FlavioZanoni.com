import svelte from "@astrojs/svelte"
import tailwind from "@astrojs/tailwind"
import { enhancedImages } from "@sveltejs/enhanced-img"
import { defineConfig } from "astro/config"

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), svelte()],
  vite: {
    plugins: [enhancedImages()],
  },
})
