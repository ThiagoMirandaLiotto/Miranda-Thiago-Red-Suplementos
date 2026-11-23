import { BadRequestError } from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";
import { asegurarObjeto, enteroPositivo } from "./validarCuerpo.js";

// V-04: entero mayor que cero. Que no supere el stock lo controla el servicio (RN-01).
function leerCantidad(cantidad) {
    if (!enteroPositivo(cantidad)) throw new BadRequestError(Messages.INVALID_QUANTITY);
    return cantidad;
}

export function validateNuevoItem(data) {
    asegurarObjeto(data, ["idProducto", "cantidad"]);
    if (!enteroPositivo(data.idProducto)) throw new BadRequestError(Messages.INVALID_PRODUCT_ID);
    return { idProducto: data.idProducto, cantidad: leerCantidad(data.cantidad) };
}

export function validateCantidad(data) {
    asegurarObjeto(data, ["cantidad"]);
    return { cantidad: leerCantidad(data.cantidad) };
}
