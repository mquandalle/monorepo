import { fileURLToPath } from 'url';
import { paraglide } from '@inlang/paraglide-js-adapter-vite';

function resolveAlias(path: string) {
  return fileURLToPath(new URL(path, import.meta.url));
}

export default defineNuxtConfig({
  devtools: { enabled: false },
  alias: {
    $lang: resolveAlias('internationalization/paraglide'),
  },
  vite: {
    plugins: [
      paraglide({
        project: './project.inlang',
        outdir: './internationalization/paraglide',
      }),
    ],
  },
  typescript: {
    tsConfig: {
      compilerOptions: {
        paths: {
          '$lang/*': ['../internationalization/paraglide/*'],
        },
      },
    },
  },
});
