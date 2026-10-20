import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Backend chỉ cho phép Socket.IO từ origin http://localhost:5713 (SocketIOConfig.setOrigin),
// nên dev server phải chạy đúng cổng này.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
});
