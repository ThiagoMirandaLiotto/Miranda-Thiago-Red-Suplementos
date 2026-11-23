import { request } from "./apiClient.js";

// F-01: cuentas de cliente e inicio de sesión. El token lo guarda quien llama (ver SesionProvider).
export function registrarse(datos) {
    return request("/auth/registro", { method: "POST", body: datos });
}

export function iniciarSesion(credenciales) {
    return request("/auth/login", { method: "POST", body: credenciales });
}

export function cerrarSesion() {
    return request("/auth/logout", { method: "POST" });
}

export function getSesion(signal) {
    return request("/auth/sesion", { signal });
}

// Datos personales del cliente con sesión.
export function updatePerfil(datos) {
    return request("/perfil", { method: "PUT", body: datos });
}
