// @ts-check
import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import compress from "astro-compress";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  integrations: [preact(), compress()],

  vite: {
    plugins: [tailwindcss()],
  },
});
