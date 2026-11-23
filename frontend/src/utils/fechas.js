import { NEGOCIO } from "./constants.js";

// Fechas del calendario del local (Buenos Aires), sin importar la zona horaria del navegador.
// Las fechas de retiro viajan como "AAAA-MM-DD" y las horas como "HH:00".
const formatoIso = new Intl.DateTimeFormat("en-CA", {
    timeZone: NEGOCIO.zonaHoraria,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
});
const formatoDiaSemana = new Intl.DateTimeFormat("es-AR", { weekday: "long", timeZone: "UTC" });
const formatoFechaHora = new Intl.DateTimeFormat("es-AR", {
    timeZone: NEGOCIO.zonaHoraria,
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
});
const formatoFechaLarga = new Intl.DateTimeFormat("es-AR", {
    timeZone: NEGOCIO.zonaHoraria,
    day: "numeric",
    month: "long"
});

function aUtc(textoFecha) {
    const [anio, mes, dia] = textoFecha.split("-").map(Number);
    return new Date(Date.UTC(anio, mes - 1, dia));
}

export function hoyEnElLocal(fecha = new Date()) {
    return formatoIso.format(fecha);
}

export function sumarDias(textoFecha, dias) {
    const fecha = aUtc(textoFecha);
    fecha.setUTCDate(fecha.getUTCDate() + dias);
    return fecha.toISOString().slice(0, 10);
}

export function diasEntre(desde, hasta) {
    return Math.round((aUtc(hasta) - aUtc(desde)) / 86_400_000);
}

// "Hoy", "Mañana", "Ayer" o "Miércoles 25/11".
export function describirDia(textoFecha, hoy = hoyEnElLocal()) {
    if (textoFecha === hoy) return "Hoy";
    if (textoFecha === sumarDias(hoy, 1)) return "Mañana";
    if (textoFecha === sumarDias(hoy, -1)) return "Ayer";
    const fecha = aUtc(textoFecha);
    const dia = formatoDiaSemana.format(fecha);
    return `${dia.charAt(0).toUpperCase()}${dia.slice(1)} ${fecha.getUTCDate()}/${fecha.getUTCMonth() + 1}`;
}

export function describirFranja(horaRetiro) {
    const hora = Number(horaRetiro.slice(0, 2));
    return `de ${hora} a ${hora + 1} h`;
}

// "Mañana, de 18 a 19 h".
export function describirRetiro({ fechaRetiro, horaRetiro }, hoy) {
    return `${describirDia(fechaRetiro, hoy)}, ${describirFranja(horaRetiro)}`;
}

// "25/11, 18:20".
export function formatFechaHora(iso) {
    return formatoFechaHora.format(new Date(iso));
}

// "25 de noviembre".
export function formatFechaLarga(textoFecha) {
    return formatoFechaLarga.format(new Date(`${textoFecha}T12:00:00`));
}

// "25/11" de una fecha "AAAA-MM-DD", para los ejes de los reportes.
export function formatDiaMes(textoFecha) {
    const fecha = aUtc(textoFecha);
    return `${fecha.getUTCDate()}/${fecha.getUTCMonth() + 1}`;
}
