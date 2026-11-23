import { BadRequestError } from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";
import { asegurarObjeto } from "./validarCuerpo.js";

export default function validateMembresia(data) {
    asegurarObjeto(data, ["membresiaActiva"]);
    if (typeof data.membresiaActiva !== "boolean") throw new BadRequestError(Messages.INVALID_MEMBERSHIP);
    return { membresiaActiva: data.membresiaActiva };
}
