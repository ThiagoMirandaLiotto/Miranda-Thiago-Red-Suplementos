import { BadRequestError } from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";
import { asegurarObjeto, leerTelefono, leerTexto } from "./validarCuerpo.js";

// Datos personales que el cliente puede cambiar. El email identifica la cuenta y no se edita.
export default function validatePerfil(data) {
    asegurarObjeto(data, ["nombre", "apellido", "telefono", "esSocioGym"]);
    const nombre = leerTexto(data.nombre, { max: 60 });
    if (!nombre) throw new BadRequestError(Messages.INVALID_FIRST_NAME);
    const apellido = leerTexto(data.apellido, { max: 60 });
    if (!apellido) throw new BadRequestError(Messages.INVALID_LAST_NAME);
    const telefono = leerTelefono(data.telefono);
    if (!telefono) throw new BadRequestError(Messages.INVALID_PHONE);
    if (typeof data.esSocioGym !== "boolean") throw new BadRequestError(Messages.INVALID_MEMBER_FLAG);
    return { nombre, apellido, telefono, esSocioGym: data.esSocioGym };
}
