import { request } from "./apiClient.js";

const PRODUCTOS_URL = "/productos";

function urlProducto(id) {
    return `${PRODUCTOS_URL}/${encodeURIComponent(id)}`;
}

export function getProductos(signal) {
    return request(PRODUCTOS_URL, { signal });
}

export function getProductoById(id, signal) {
    return request(urlProducto(id), { signal });
}

export function createProducto(producto) {
    return request(PRODUCTOS_URL, { method: "POST", body: producto });
}

export function updateProducto(id, producto) {
    return request(urlProducto(id), { method: "PUT", body: producto });
}

// La API hace baja lógica: el producto deja de listarse, pero no se borra.
export function deleteProducto(id) {
    return request(urlProducto(id), { method: "DELETE" });
}
