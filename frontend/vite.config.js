import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// La API de la Entrega 2 no habilita CORS y escucha solo en 127.0.0.1.
// El proxy la expone en el mismo origen que el frontend, sin modificar el backend.
const API_TARGET = "http://127.0.0.1:3000";

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: { "/api": API_TARGET }
    },
    preview: {
        proxy: { "/api": API_TARGET }
    }
});
