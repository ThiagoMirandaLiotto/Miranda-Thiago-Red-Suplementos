import { NEGOCIO } from "./constants.js";
import { describirFranja, hoyEnElLocal } from "./fechas.js";
import { horaEnElLocal } from "./horario.js";

// Estados del pedido (Análisis del Sistema, punto 5), con los textos que ve cada perfil.
export const ESTADO = Object.freeze({
    PENDIENTE: "PENDIENTE",
    LISTO_PARA_RETIRAR: "LISTO_PARA_RETIRAR",
    ENTREGADO: "ENTREGADO",
    CANCELADO: "CANCELADO",
    VENCIDO: "VENCIDO"
});

export const ETIQUETA_ESTADO = Object.freeze({
    PENDIENTE: "Pendiente",
    LISTO_PARA_RETIRAR: "Listo para retirar",
    ENTREGADO: "Entregado",
    CANCELADO: "Cancelado",
    VENCIDO: "Vencido"
});

export const ESTADOS_ACTIVOS = Object.freeze([ESTADO.PENDIENTE, ESTADO.LISTO_PARA_RETIRAR]);

export function estaActivo(pedido) {
    return ESTADOS_ACTIVOS.includes(pedido.estado);
}

// El paso siguiente del administrador (F-05). Cancelar va aparte, porque pide un motivo.
export function siguientePaso(pedido) {
    if (pedido.estado === ESTADO.PENDIENTE) {
        return { estado: ESTADO.LISTO_PARA_RETIRAR, etiqueta: "Marcar listo para retirar", corta: "Marcar listo" };
    }
    if (pedido.estado === ESTADO.LISTO_PARA_RETIRAR) {
        return { estado: ESTADO.ENTREGADO, etiqueta: "Marcar entregado", corta: "Entregado" };
    }
    return null;
}

// Franja ya terminada sin retirar: todavía no venció (eso pasa a las 48 h), pero conviene verlo.
export function estaAtrasado(pedido, hoy = hoyEnElLocal(), horaActual = horaEnElLocal()) {
    if (!estaActivo(pedido)) return false;
    if (pedido.fechaRetiro !== hoy) return pedido.fechaRetiro < hoy;
    return Number(pedido.horaRetiro.slice(0, 2)) + 1 <= horaActual;
}

// Franjas de una hora entre la apertura y el cierre: 07:00 (7 a 8 h) … 21:00 (21 a 22 h).
export const FRANJAS = Object.freeze(
    Array.from({ length: NEGOCIO.horario.cierre - NEGOCIO.horario.apertura }, (_, indice) => {
        const hora = NEGOCIO.horario.apertura + indice;
        const valor = `${String(hora).padStart(2, "0")}:00`;
        return { valor, etiqueta: describirFranja(valor), fin: hora + 1 };
    })
);

// Las franjas de hoy que ya terminaron no se pueden elegir (misma regla que la API).
export function franjasDisponibles(fecha, hoy = hoyEnElLocal(), horaActual = horaEnElLocal()) {
    return FRANJAS.filter((franja) => fecha !== hoy || franja.fin > horaActual);
}

export function cantidadDeUnidades(pedido) {
    return pedido.detalles.reduce((suma, detalle) => suma + detalle.cantidad, 0);
}

export function resumirProductos(detalles) {
    return detalles.map((detalle) => `${detalle.cantidad} × ${detalle.nombre}`).join(" · ");
}
