export const ESTADO_STOCK = Object.freeze({
    SIN_STOCK: "sin-stock",
    BAJO: "bajo",
    DISPONIBLE: "disponible"
});

// Equivale a stockCritico() del modelo, que la API no envía en el JSON.
export function estadoStock({ stock, stockMinimo }) {
    if (stock === 0) return ESTADO_STOCK.SIN_STOCK;
    if (stock < stockMinimo) return ESTADO_STOCK.BAJO;
    return ESTADO_STOCK.DISPONIBLE;
}
