import path from "path"
import fs from "fs"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const certPath = path.resolve(__dirname, "certs")
const https = fs.existsSync(path.join(certPath, "cert.pem"))
  ? {
      key: fs.readFileSync(path.join(certPath, "key.pem")),
      cert: fs.readFileSync(path.join(certPath, "cert.pem")),
    }
  : undefined

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    modules: [path.resolve(__dirname, "node_modules"), "node_modules"],
  },
  server: {
    port: 5173,
    https,
    proxy: {
      '/api': {
        target: 'https://127.0.0.1:8443',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
