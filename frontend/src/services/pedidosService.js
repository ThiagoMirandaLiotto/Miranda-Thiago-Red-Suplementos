import { request } from "./apiClient.js";

const PEDIDOS_URL = "/pedidos";

function urlPedido(id) {
    return `${PEDIDOS_URL}/${encodeURIComponent(id)}`;
}

// El administrador recibe todos los pedidos; el cliente, solo los suyos.
export function getPedidos({ estado, busqueda, signal } = {}) {
    const params = new URLSearchParams();
    if (estado) params.set("estado", estado);
    if (busqueda) params.set("busqueda", busqueda);
    const consulta = params.size ? `?${params}` : "";
    return request(`${PEDIDOS_URL}${consulta}`, { signal });
}

export function getPedido(id, signal) {
    return request(urlPedido(id), { signal });
}

// Confirma el carrito del administrador. Devuelve { pedido, alertasStock }.
export function crearPedido(datos) {
    return request(PEDIDOS_URL, { method: "POST", body: datos });
}

export function cambiarEstadoPedido(id, estado, motivo) {
    const body = motivo === undefined ? { estado } : { estado, motivo };
    return request(`${urlPedido(id)}/estado`, { method: "PATCH", body });
}

// Carga los productos del pedido en el carrito. Devuelve { carrito, avisos, idCliente, cliente }.
export function repetirPedido(id) {
    return request(`${urlPedido(id)}/repetir`, { method: "POST" });
}
