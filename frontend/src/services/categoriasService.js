import { request } from "./apiClient.js";

const CATEGORIAS_URL = "/categorias";

export function getCategorias(signal) {
    return request(CATEGORIAS_URL, { signal });
}
