import { defineConfig, loadEnv, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import { createHtmlPlugin } from 'vite-plugin-html';
import svg from 'vite-plugin-svgr';
import compress from 'vite-plugin-compression';
import { manualChunksPlugin } from 'vite-plugin-webpackchunkname';
import usePluginImport from 'vite-plugin-importer';
import markdown from './vite-config/plugins/vite-plugin-markdown';
import visualizer from 'rollup-plugin-visualizer';
import path from 'path';

export default defineConfig(({ command, mode }) => {
  const isEnvProduction = command === 'build';
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return {
    root: process.cwd(),
    base: process.env.VITE_PUBLIC_PATH,
    define: {
      'process.env': process.env,
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: {
        '@': path.resolve(process.cwd(), 'src'),
      },
    },
    css: {
      modules: false,
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          additionalData: '@import "@/variable.less";', // 导入全局的样式文件
        },
      },
    },
    server: {
      https: true,
      port: 5000,
      open: true,
      proxy: {
        '/api': {
          target: 'http://localhost:4001',
          changeOrigin: true,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        },
        '/socket.io': {
          target: 'http://localhost:4001',
          changeOrigin: true,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
          ws: true,
        },
      },
    },
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets', // 相对于build.outDir而言
      rollupOptions: {
        input: path.resolve(process.cwd(), 'index.html'),
        output: {
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/static/[name]-[hash].[ext]',
        },
      },
      terserOptions: isEnvProduction
        ? {
            compress: {
              // 生产环境移除console
              drop_console: true,
              drop_debugger: true,
            },
          }
        : undefined,
    },
    plugins: [
      react({
        babel: {
          babelrc: true,
          
        },
      }),
      svg({
        exportAsDefault: true,
      }),
      markdown(),
      usePluginImport({
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: true,
      }),
      manualChunksPlugin(),
      splitVendorChunkPlugin(),
      legacy({
        targets: ['> 1%', 'last 2 versions', 'not ie <= 11'],
        additionalLegacyPolyfills: ['regenerator-runtime/runtime'], // 面向IE11时需要此插件
      }),
      compress({
        threshold: 1024 * 50,
        algorithm: 'gzip',
        ext: '.gz',
      }),
      createHtmlPlugin({
        minify: true,
        entry: '/src/index.tsx',
        template: 'index.html',
        inject: {
          data: {
            title: 'Soul Harbor',
            favicon: `${process.env.VITE_PUBLIC_PATH}src/favicon.ico`,
          },
        },
      }),
      visualizer({
        open: true,
        template: 'treemap',
        gzipSize: true,
        brotliSize: true,
      }),
    ],
  };
});
