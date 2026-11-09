import { NEGOCIO } from "./constants.js";

const formatoHora = new Intl.DateTimeFormat("es-AR", {
    timeZone: NEGOCIO.zonaHoraria,
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23"
});

// Hora decimal en Buenos Aires (por ejemplo 21.5), sin importar la zona horaria del navegador.
export function horaEnElLocal(fecha = new Date()) {
    const partes = formatoHora.formatToParts(fecha);
    const hora = Number(partes.find((parte) => parte.type === "hour").value);
    const minutos = Number(partes.find((parte) => parte.type === "minute").value);
    return hora + minutos / 60;
}

export function estadoDelLocal(fecha = new Date()) {
    const ahora = horaEnElLocal(fecha);
    const { apertura, cierre } = NEGOCIO.horario;
    if (ahora >= apertura && ahora < cierre) {
        return { abierto: true, texto: `Estamos abiertos hasta las ${cierre} h: si escribís ahora, lo retirás hoy.` };
    }
    if (ahora < apertura) {
        return { abierto: false, texto: `Abrimos a las ${apertura} h: escribinos y lo dejamos listo para retirar.` };
    }
    return { abierto: false, texto: `Ya cerramos por hoy. Mañana abrimos a las ${apertura} h: escribinos y lo dejamos listo.` };
}
