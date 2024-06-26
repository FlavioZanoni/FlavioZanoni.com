import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import { enhancedImages } from "@sveltejs/enhanced-img";
import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), svelte(), mdx()],
  vite: {
    plugins: [enhancedImages()]
  }
});