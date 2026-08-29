// @ts-check
import { defineConfig } from "astro/config";
import compress from "astro-compress";
import tailwindcss from "@tailwindcss/vite";
import preactVite from "@preact/preset-vite";

export default defineConfig({
  integrations: [compress()],

  vite: {
    plugins: [tailwindcss(), preactVite()],
  },
});
