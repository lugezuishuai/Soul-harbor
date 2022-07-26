import { Plugin } from 'vite';
import { createFilter } from '@rollup/pluginutils';

export default function vitePluginMarkdown(): Plugin {
  const filter = createFilter(['**/*.md']);

  return {
    name: '@jacksonhuang/vite-plugin-markdown',
    enforce: 'pre',
    transform(code, id) {
      if (!filter(id)) {
        return;
      }

      return {
        code: `export default ${JSON.stringify(code)};`,
        map: null,
      };
    },
  };
}
