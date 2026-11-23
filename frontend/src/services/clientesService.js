import { request } from "./apiClient.js";

export function getClientes({ busqueda, signal } = {}) {
    const consulta = busqueda ? `?busqueda=${encodeURIComponent(busqueda)}` : "";
    return request(`/clientes${consulta}`, { signal });
}

// RN-09: el local confirma (o quita) la membresía de RED GYM que habilita el 10 %.
export function cambiarMembresia(idCliente, membresiaActiva) {
    return request(`/clientes/${encodeURIComponent(idCliente)}/membresia`, { method: "PATCH", body: { membresiaActiva } });
}
