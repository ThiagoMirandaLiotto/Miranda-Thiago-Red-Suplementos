// Único archivo del frontend que usa fetch. Los servicios de cada recurso
// lo llaman con su ruta; acá se resuelven la URL, el JSON y los errores.
const API_URL = import.meta.env.VITE_API_URL ?? "/api";
const DEMORA_MS = Number(import.meta.env.VITE_DEMORA_API_MS) || 0;

const MENSAJE_SIN_CONEXION = "No pudimos conectar con el servidor. Volvé a intentar en unos segundos.";

export class ApiError extends Error {
    constructor(message, status) {
        super(message);
        this.name = "ApiError";
        // 0 significa que no hubo respuesta de la API.
        this.status = status;
    }
}

function esperar(ms, signal) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(resolve, ms);
        signal?.addEventListener("abort", () => {
            clearTimeout(timer);
            reject(signal.reason);
        }, { once: true });
    });
}

async function leerJson(response) {
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) return null;
    try {
        return await response.json();
    } catch {
        return null;
    }
}

export async function request(path, { method = "GET", body, signal } = {}) {
    if (DEMORA_MS > 0) await esperar(DEMORA_MS, signal);

    const options = { method, signal };
    if (method === "GET") options.cache = "no-store";
    if (body !== undefined) {
        options.headers = { "Content-Type": "application/json" };
        options.body = JSON.stringify(body);
    }

    let response;
    try {
        response = await fetch(`${API_URL}${path}`, options);
    } catch (error) {
        if (signal?.aborted) throw error;
        throw new ApiError(MENSAJE_SIN_CONEXION, 0);
    }

    // Con el backend apagado, el proxy de Vite responde sin JSON.
    const payload = await leerJson(response);
    if (!payload) throw new ApiError(MENSAJE_SIN_CONEXION, 0);
    if (!response.ok || !payload.success) {
        throw new ApiError(payload.message ?? MENSAJE_SIN_CONEXION, response.status);
    }
    return payload.data;
}
