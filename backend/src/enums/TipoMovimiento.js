// Cada cambio de stock queda registrado con uno de estos tipos (F-06, Anexo B).
// INGRESO y AJUSTE los carga el administrador; VENTA y DEVOLUCION los generan los pedidos.
export const TipoMovimiento = Object.freeze({
    INGRESO: "INGRESO",
    VENTA: "VENTA",
    AJUSTE: "AJUSTE",
    DEVOLUCION: "DEVOLUCION"
});
