import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  base: "/",
  plugins: [react()],
  preview: {
    port: 80,
    strictPort: true,
  },
  server: {
    port: 80,
    strictPort: true,
    host: true,
    origin: "http://0.0.0.0:8080",
  },
});

// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react-swc'
//
// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     proxy: {
//       "/api": {
//         target: 'http://127.0.0.1:8080',
//         changeOrigin: true,
//       }
//     }
//   }
// })
