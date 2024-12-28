import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({   //Will send the request to the backend server
  plugins: [react()],
  server: {
    proxy: {
      '/api': { // This matches any request starting with `/api`
        target: 'https://dentist-website-production.up.railway.app', // Your backend URL
        changeOrigin: true,
        secure: false,
      },
    },
  },
})  //added proxy because it bypasses the CORS policy and sends the request to the backend server
    //and it makes our code more writable and readable, and thus makes the debugging easier