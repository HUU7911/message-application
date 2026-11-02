import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Backend chỉ cho phép CORS / Socket.IO từ http://localhost:5173 nên cố định cổng này.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
});
