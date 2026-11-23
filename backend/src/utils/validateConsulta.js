import { BadRequestError } from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";
import { EstadoPedido } from "../enums/EstadoPedido.js";
import { diasEntre, fechaLocal, parseFecha, sumarDias } from "./fechas.js";

// Parámetros de la URL (?desde=...&hasta=...). Si se repiten llegan como arreglo y se rechazan.

// Período de un reporte. Por defecto, los últimos 30 días incluido hoy.
export function validatePeriodo(query, ahora) {
    const { desde, hasta } = query;
    const fin = hasta === undefined ? parseFecha(fechaLocal(ahora)) : parseFecha(hasta);
    const inicio = desde === undefined && fin ? sumarDias(fin, -29) : parseFecha(desde);
    if (!inicio || !fin || inicio > fin || diasEntre(inicio, fin) > 365) {
        throw new BadRequestError(Messages.INVALID_PERIOD);
    }
    const finDelDia = sumarDias(fin, 1);
    return { desde: fechaLocal(inicio), hasta: fechaLocal(fin), inicio, finExclusivo: finDelDia };
}

export function validateLimite(valor, porDefecto = 5) {
    if (valor === undefined) return porDefecto;
    if (typeof valor !== "string" || !/^\d{1,2}$/.test(valor)) throw new BadRequestError(Messages.INVALID_LIMIT);
    const limite = Number(valor);
    if (limite < 1 || limite > 20) throw new BadRequestError(Messages.INVALID_LIMIT);
    return limite;
}

export function validateFiltroEstado(valor) {
    if (valor === undefined || valor === "") return null;
    if (!Object.values(EstadoPedido).includes(valor)) throw new BadRequestError(Messages.INVALID_STATUS_FILTER);
    return valor;
}

// Búsqueda de texto libre: se ignora lo que no sea un texto corto.
export function leerBusqueda(valor) {
    return typeof valor === "string" ? valor.trim().slice(0, 80) : "";
}
