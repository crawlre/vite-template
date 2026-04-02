import { defineConfig } from 'vite';
import { ViteEjsPlugin } from 'vite-plugin-ejs';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { globSync } from 'glob';
import path from 'path';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  base: './',
  server: {
    open: true,
    // EJSの変更を監視し、ホットリロードを確実にするための設定
    watch: {
      usePolling: true,
    },
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: Object.fromEntries(
        globSync('src/**/*.html').map((file) => [
          path.relative('src', file.slice(0, file.length - path.extname(file).length)),
          path.resolve(__dirname, file),
        ])
      ),
      output: {
        entryFileNames: `assets/js/[name].js`,
        chunkFileNames: `assets/js/[name].js`,
        assetFileNames: (assetInfo) => {
          // 拡張子ごとにフォルダを振り分ける
          if (/\.(s?css)$/.test(assetInfo.name)) {
            return 'assets/css/style.[ext]';
          }
          if (/\.(jpe?g|png|gif|svg|webp|avif)$/.test(assetInfo.name)) {
            return 'assets/images/[name].[ext]';
          }
          if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)) {
            return 'assets/fonts/[name].[ext]';
          }
          return 'assets/[name].[ext]';
        },
      },
    },
  },
  plugins: [
    // EJSの設定：将来的に共通データを渡す場合はここに記述可能
    ViteEjsPlugin({
      title: 'My Project', // ejs側で <%= title %> と使える
    }),

    ViteImageOptimizer({
      png: { quality: 80 },
      jpeg: { quality: 80 },
      jpg: { quality: 80 },
      webp: { lossless: true },
      svg: {
        multipass: true,
        plugins: [{ name: 'removeViewBox', active: false }],
      },
    }),

    // カスタムプラグインを整理：EJSリロードの仕組み
    {
      name: 'ejs-hmr',
      handleHotUpdate({ file, server }) {
        if (file.endsWith('.ejs')) {
          server.ws.send({ type: 'full-reload' });
        }
      },
    },
  ],
});
