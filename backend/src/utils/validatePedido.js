import { BadRequestError } from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";
import { Negocio } from "../enums/Negocio.js";
import { asegurarObjeto, enteroPositivo, leerContacto, leerTexto } from "./validarCuerpo.js";
import { diasEntre, inicioDelDia, parseFecha, parseHora } from "./fechas.js";

// RN-03 y V-06: fecha de hoy en adelante y una franja de una hora dentro del horario del local.
export function validateRetiro(fechaRetiro, horaRetiro, ahora) {
    const fecha = parseFecha(fechaRetiro);
    if (!fecha) throw new BadRequestError(Messages.INVALID_PICKUP_DATE);
    const hoy = inicioDelDia(ahora);
    if (fecha < hoy) throw new BadRequestError(Messages.PAST_PICKUP_DATE);
    if (diasEntre(hoy, fecha) > Negocio.diasMaximosAnticipacion) {
        throw new BadRequestError(Messages.PICKUP_TOO_FAR);
    }
    const hora = parseHora(horaRetiro);
    if (hora === null || hora < Negocio.horaApertura || hora >= Negocio.horaCierre) {
        throw new BadRequestError(Messages.INVALID_PICKUP_TIME);
    }
    const finDeLaFranja = new Date(fecha);
    finDeLaFranja.setHours(hora + 1);
    if (finDeLaFranja <= ahora) throw new BadRequestError(Messages.PICKUP_TIME_PASSED);
    return { fechaRetiro, horaRetiro };
}

// El pedido es de un cliente registrado (idCliente) o de alguien que escribió por Instagram sin cuenta (cliente).
function validateCliente(data) {
    const conCuenta = data.idCliente !== undefined && data.idCliente !== null;
    const sinCuenta = data.cliente !== undefined && data.cliente !== null;
    if (conCuenta === sinCuenta) throw new BadRequestError(Messages.INVALID_CLIENT_REF);
    if (conCuenta) {
        if (!enteroPositivo(data.idCliente)) throw new BadRequestError(Messages.INVALID_CLIENT_ID);
        return { idCliente: data.idCliente };
    }
    if (typeof data.cliente !== "object" || Array.isArray(data.cliente)) {
        throw new BadRequestError(Messages.INVALID_CLIENT_REF);
    }
    asegurarObjeto(data.cliente, ["nombre", "contacto"]);
    const nombre = leerTexto(data.cliente.nombre, { max: 80 });
    if (!nombre) throw new BadRequestError(Messages.INVALID_GUEST_NAME);
    const contacto = leerContacto(data.cliente.contacto);
    if (!contacto) throw new BadRequestError(Messages.INVALID_GUEST_CONTACT);
    return { cliente: { nombre, contacto } };
}

export default function validatePedido(data, ahora) {
    asegurarObjeto(data, ["idCliente", "cliente", "fechaRetiro", "horaRetiro"]);
    return { ...validateCliente(data), ...validateRetiro(data.fechaRetiro, data.horaRetiro, ahora) };
}
