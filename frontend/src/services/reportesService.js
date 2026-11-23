import { request } from "./apiClient.js";

function conPeriodo(ruta, { desde, hasta }) {
    return `/reportes/${ruta}?${new URLSearchParams({ desde, hasta })}`;
}

export function getVentas(periodo, signal) {
    return request(conPeriodo("ventas", periodo), { signal });
}

export function getMasVendidos(periodo, signal) {
    return request(conPeriodo("mas-vendidos", periodo), { signal });
}

export function getCancelados(periodo, signal) {
    return request(conPeriodo("cancelados", periodo), { signal });
}

export function getStockCritico(signal) {
    return request("/reportes/stock-critico", { signal });
}
