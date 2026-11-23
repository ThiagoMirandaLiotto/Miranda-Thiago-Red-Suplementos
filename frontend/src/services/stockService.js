import { request } from "./apiClient.js";

function urlMovimientos(idProducto) {
    return `/productos/${encodeURIComponent(idProducto)}/movimientos`;
}

export function getMovimientos(idProducto, signal) {
    return request(urlMovimientos(idProducto), { signal });
}

// INGRESO de mercadería o AJUSTE con motivo. Devuelve { producto, movimiento, alertaStock }.
export function registrarMovimiento(idProducto, movimiento) {
    return request(urlMovimientos(idProducto), { method: "POST", body: movimiento });
}
