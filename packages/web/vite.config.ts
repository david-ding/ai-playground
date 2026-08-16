import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import { prepareBrand } from './prepare-brand.mjs';

function brandPlugin(): Plugin {
  const brand = process.env.VITE_BRAND || 'brand-a';
  return {
    name: 'brand-theme',
    buildStart() {
      prepareBrand(brand);
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), brandPlugin()],
});
