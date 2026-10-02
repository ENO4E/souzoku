import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 公開サーバーのフォルダ構成に合わせた出力先
//   assets/css/  … CSS
//   assets/js/   … JavaScript
//   assets/      … 画像（public/assets/ に置いたものもここに並ぶ）
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  build: isSsrBuild
    ? {}
    : {
        // ファイル名は固定（ハッシュなし）。手動アップロード時に index.html と CSS/JS の
        // 組み合わせがずれて表示が壊れるのを防ぐ。キャッシュ対策は scripts/prerender.mjs が
        // index.html 内の URL に ?v=ビルド時刻 を付けることで行う
        rollupOptions: {
          output: {
            entryFileNames: 'assets/js/index.js',
            // 遅延読み込みのチャンク（three.js の粒子背景など）は内容ハッシュ付き。index.js だけ固定名
            chunkFileNames: 'assets/js/[name]-[hash].js',
            assetFileNames: (info) => {
              const name = info.names?.[0] || info.name || ''
              return name.endsWith('.css') ? 'assets/css/index[extname]' : 'assets/[name][extname]'
            },
          },
        },
      },
}))
