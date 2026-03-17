import { defineConfig } from 'vite';
import { ViteEjsPlugin } from 'vite-plugin-ejs';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { globSync } from 'glob';
import path from 'path';

export default defineConfig({
  root: 'src', // 開発の基点をsrcフォルダにする
  base: './', // ビルド後のパスを相対パスにする
  server: { open: true }, //ブラウザを自動で立ち上げてページを開くようにする
  build: {
    outDir: '../dist', // ビルド先をプロジェクト直下のdistにする
    emptyOutDir: true, // outDirがrootの外部にある場合に警告を出さない
    rollupOptions: {
      // 複数ページ（index.html以外）も自動でビルド対象にする設定
      // srcフォルダ構造を含まないように、ファイル名をキーとしたオブジェクトを作成する
      input: Object.fromEntries(
        globSync('src/**/*.html').map((file) => [
          // "src/" を削除し、拡張子を除いた名前をキーにする (例: "index")
          path.relative('src', file.slice(0, file.length - path.extname(file).length)),
          // 絶対パスを値にする
          path.resolve(__dirname, file),
        ])
      ),
    },
  },
  plugins: [
    ViteEjsPlugin(), // EJSを使えるようにする
    // 画像圧縮設定 (Sharpベース)
    ViteImageOptimizer({
      png: {
        quality: 80,
      },
      jpeg: {
        quality: 80,
      },
      jpg: {
        quality: 80,
      },
      webp: {
        lossless: true,
      },
      svg: {
        multipass: true,
        plugins: [{ name: 'removeViewBox', active: false }],
      },
    }),
    // EJSの変更を強制的に検知させる
    {
      name: 'watch-ejs',
      handleHotUpdate({ file, server }) {
        if (file.endsWith('.ejs')) {
          server.ws.send({ type: 'full-reload' });
        }
      },
    },
  ],
});
