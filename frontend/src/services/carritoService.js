import { request } from "./apiClient.js";

// Carrito del administrador para registrar un pedido. Cada respuesta trae el carrito completo,
// con precios, subtotales, descuento y total calculados por la API.
const CARRITO_URL = "/carrito";

export function getCarrito({ idCliente, signal } = {}) {
    const consulta = idCliente ? `?idCliente=${encodeURIComponent(idCliente)}` : "";
    return request(`${CARRITO_URL}${consulta}`, { signal });
}

export function agregarAlCarrito(idProducto, cantidad) {
    return request(`${CARRITO_URL}/items`, { method: "POST", body: { idProducto, cantidad } });
}

export function cambiarCantidad(idProducto, cantidad) {
    return request(`${CARRITO_URL}/items/${encodeURIComponent(idProducto)}`, { method: "PATCH", body: { cantidad } });
}

export function quitarDelCarrito(idProducto) {
    return request(`${CARRITO_URL}/items/${encodeURIComponent(idProducto)}`, { method: "DELETE" });
}

export function vaciarCarrito() {
    return request(CARRITO_URL, { method: "DELETE" });
}
