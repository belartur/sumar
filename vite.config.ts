import { defineConfig, type Plugin } from 'vitest/config';

/**
 * Osadza zbudowany JS i CSS bezpośrednio w index.html.
 * Dzięki temu dist/index.html działa również po otwarciu z dysku (file://),
 * gdzie przeglądarki blokują zewnętrzne skrypty modułów ES.
 */
function osadzZasoby(): Plugin {
  return {
    name: 'sumar-osadz-zasoby',
    apply: 'build',
    enforce: 'post',
    generateBundle(_opcje, pakiet) {
      const html = pakiet['index.html'];
      if (!html || html.type !== 'asset') return;

      let zrodlo = String(html.source);

      for (const [nazwa, plik] of Object.entries(pakiet)) {
        if (plik.type !== 'asset' || !nazwa.endsWith('.css')) continue;
        const wzor = new RegExp(`<link[^>]+href="[^"]*${uciekaj(nazwa)}"[^>]*>`);
        if (!wzor.test(zrodlo)) continue;
        const css = String(plik.source).replace(/<\/style/gi, '<\\/style');
        zrodlo = zrodlo.replace(wzor, `<style>${css}</style>`);
        delete pakiet[nazwa];
      }

      for (const [nazwa, plik] of Object.entries(pakiet)) {
        if (plik.type !== 'chunk' || !nazwa.endsWith('.js')) continue;
        const wzor = new RegExp(`<script[^>]+src="[^"]*${uciekaj(nazwa)}"[^>]*></script>`);
        if (!wzor.test(zrodlo)) continue;
        const kod = plik.code.replace(/<\/script/gi, '<\\/script');
        zrodlo = zrodlo.replace(wzor, `<script type="module">${kod}</script>`);
        delete pakiet[nazwa];
      }

      html.source = zrodlo;
    },
  };
}

function uciekaj(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default defineConfig({
  base: './',
  plugins: [osadzZasoby()],
  build: {
    rollupOptions: {
      output: {
        // Jeden plik JS — wszystkie zasoby trafiają do index.html.
        inlineDynamicImports: true,
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
