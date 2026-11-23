// Ciclo de vida del pedido (Análisis del Sistema, punto 5):
// PENDIENTE → LISTO_PARA_RETIRAR → ENTREGADO, con salidas CANCELADO y VENCIDO antes de la entrega.
export const EstadoPedido = Object.freeze({
    PENDIENTE: "PENDIENTE",
    LISTO_PARA_RETIRAR: "LISTO_PARA_RETIRAR",
    ENTREGADO: "ENTREGADO",
    CANCELADO: "CANCELADO",
    VENCIDO: "VENCIDO"
});

// Estados con stock reservado: todavía se pueden entregar, cancelar o vencer.
export const ESTADOS_ACTIVOS = Object.freeze([EstadoPedido.PENDIENTE, EstadoPedido.LISTO_PARA_RETIRAR]);

// Para los mensajes de error.
export const NombreEstado = Object.freeze({
    PENDIENTE: "pendiente",
    LISTO_PARA_RETIRAR: "listo para retirar",
    ENTREGADO: "entregado",
    CANCELADO: "cancelado",
    VENCIDO: "vencido"
});
