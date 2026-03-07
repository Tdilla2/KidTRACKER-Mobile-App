import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { transform, Features } from 'lightningcss'

function stripCascadeLayers(css: string): string {
  let result = '';
  let i = 0;
  while (i < css.length) {
    // Check for @layer rule
    if (css[i] === '@' && css.substring(i, i + 6) === '@layer') {
      const braceIdx = css.indexOf('{', i);
      if (braceIdx === -1) { result += css[i]; i++; continue; }
      const semiIdx = css.indexOf(';', i);
      // @layer name; (declaration without block) - keep as empty string
      if (semiIdx !== -1 && semiIdx < braceIdx) { i = semiIdx + 1; continue; }
      // @layer name { ... } - unwrap contents
      let depth = 1;
      let j = braceIdx + 1;
      while (j < css.length && depth > 0) {
        if (css[j] === '{') depth++;
        else if (css[j] === '}') depth--;
        j++;
      }
      // Extract inner content (between opening { and matching })
      result += css.substring(braceIdx + 1, j - 1);
      i = j;
    } else {
      result += css[i];
      i++;
    }
  }
  return result;
}

/** Replace `import.meta.url` in JS output so it works in non-module scripts (Chrome 68 WebView). */
function replaceImportMetaUrl(): import('vite').Plugin {
  return {
    name: 'replace-import-meta-url',
    enforce: 'post',
    apply: 'build',
    renderChunk(code) {
      if (code.includes('import.meta.url')) {
        return code.replace(/import\.meta\.url/g, 'document.baseURI');
      }
      return null;
    },
  };
}

/** Strip `type="module"` and `crossorigin` from script tags so old WebViews load the bundle. */
function stripModuleAttrs(): import('vite').Plugin {
  return {
    name: 'strip-module-attrs',
    enforce: 'post',
    apply: 'build',
    transformIndexHtml(html) {
      return html
        .replace(/ type="module"/g, ' defer')
        .replace(/ crossorigin/g, '');
    },
  };
}

function cssDownlevel(): import('vite').Plugin {
  return {
    name: 'css-downlevel',
    enforce: 'post',
    generateBundle(_options, bundle) {
      for (const [filename, chunk] of Object.entries(bundle)) {
        if (filename.endsWith('.css') && chunk.type === 'asset') {
          // 1. Strip @layer wrappers (not supported in Chrome <99)
          let css = stripCascadeLayers(chunk.source as string);
          // 2. Remove lab()/oklch() custom property values — the hex fallbacks
          //    defined before them will take effect on older browsers
          css = css.replace(/--[\w-]+:\s*(?:lab|oklch|lch|oklab|color)\([^;]*\);?/g, '');
          // 3. Downlevel remaining modern CSS via lightningcss
          const { code } = transform({
            filename,
            code: Buffer.from(css),
            targets: { chrome: (68 << 16) },
          });
          chunk.source = code.toString();
        }
      }
    },
  };
}

const isCapacitor = !process.env.AMPLIFY_BUILD;

export default defineConfig({
  base: './',
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    ...(isCapacitor ? [cssDownlevel(), replaceImportMetaUrl(), stripModuleAttrs()] : []),
  ],
  build: {
    target: isCapacitor ? 'es2017' : 'esnext',
    cssMinify: 'lightningcss',
    ...(isCapacitor && {
      rollupOptions: {
        output: {
          // Inline dynamic imports so Capacitor plugins don't use import.meta.url
          inlineDynamicImports: true,
        },
      },
    }),
  },
  css: {
    lightningcss: {
      ...(isCapacitor && {
        targets: {
          chrome: (68 << 16),
        },
      }),
    },
  },
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
})
