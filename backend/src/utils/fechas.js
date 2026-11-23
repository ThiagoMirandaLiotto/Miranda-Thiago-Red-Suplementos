// Fechas de calendario en la hora local del servidor (el local está en Buenos Aires).
const FORMATO_FECHA = /^(\d{4})-(\d{2})-(\d{2})$/;
const FORMATO_HORA = /^(\d{2}):00$/;
const MS_POR_DIA = 86_400_000;

// "AAAA-MM-DD" de un Date.
export function fechaLocal(fecha) {
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    return `${fecha.getFullYear()}-${mes}-${dia}`;
}

// Date a las 0 h de una fecha "AAAA-MM-DD", o null si no existe (por ejemplo 2026-02-30).
export function parseFecha(texto) {
    if (typeof texto !== "string") return null;
    const partes = FORMATO_FECHA.exec(texto);
    if (!partes) return null;
    const [anio, mes, dia] = partes.slice(1).map(Number);
    const fecha = new Date(anio, mes - 1, dia);
    const existe = fecha.getFullYear() === anio && fecha.getMonth() === mes - 1 && fecha.getDate() === dia;
    return existe ? fecha : null;
}

// Hora de inicio de una franja "HH:00", o null.
export function parseHora(texto) {
    if (typeof texto !== "string") return null;
    const partes = FORMATO_HORA.exec(texto);
    return partes ? Number(partes[1]) : null;
}

export function inicioDelDia(fecha) {
    return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
}

export function sumarDias(fecha, dias) {
    const resultado = new Date(fecha);
    resultado.setDate(resultado.getDate() + dias);
    return resultado;
}

export function diasEntre(desde, hasta) {
    return Math.round((inicioDelDia(hasta) - inicioDelDia(desde)) / MS_POR_DIA);
}

// Momento exacto de una fecha "AAAA-MM-DD" a una hora dada.
export function combinarFechaHora(textoFecha, hora) {
    const fecha = parseFecha(textoFecha);
    fecha.setHours(hora, 0, 0, 0);
    return fecha;
}
