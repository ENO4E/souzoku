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
        // 組み合わせがずれて表示が壊れるのを防ぐ。キャッシュは .htaccess 側で短めに設定
        rollupOptions: {
          output: {
            entryFileNames: 'assets/js/index.js',
            chunkFileNames: 'assets/js/[name].js',
            assetFileNames: (info) => {
              const name = info.names?.[0] || info.name || ''
              return name.endsWith('.css') ? 'assets/css/index[extname]' : 'assets/[name][extname]'
            },
          },
        },
      },
}))
