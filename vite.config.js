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
        rollupOptions: {
          output: {
            entryFileNames: 'assets/js/[name]-[hash].js',
            chunkFileNames: 'assets/js/[name]-[hash].js',
            assetFileNames: (info) => {
              const name = info.names?.[0] || info.name || ''
              return name.endsWith('.css') ? 'assets/css/[name]-[hash][extname]' : 'assets/[name]-[hash][extname]'
            },
          },
        },
      },
}))
