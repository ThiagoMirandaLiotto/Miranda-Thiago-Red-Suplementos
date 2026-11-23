import { BadRequestError } from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";
import { asegurarObjeto, contrasenaValida, leerEmail, leerTelefono, leerTexto } from "./validarCuerpo.js";

const permitidos = ["nombre", "apellido", "email", "telefono", "contrasena", "confirmacion", "esSocioGym"];

// V-01, V-02, V-03 y V-07, en el mismo orden que los campos del formulario de registro.
export default function validateRegistro(data) {
    asegurarObjeto(data, permitidos);
    const nombre = leerTexto(data.nombre, { max: 60 });
    if (!nombre) throw new BadRequestError(Messages.INVALID_FIRST_NAME);
    const apellido = leerTexto(data.apellido, { max: 60 });
    if (!apellido) throw new BadRequestError(Messages.INVALID_LAST_NAME);
    const email = leerEmail(data.email);
    if (!email) throw new BadRequestError(Messages.INVALID_EMAIL);
    const telefono = leerTelefono(data.telefono);
    if (!telefono) throw new BadRequestError(Messages.INVALID_PHONE);
    if (!contrasenaValida(data.contrasena)) throw new BadRequestError(Messages.INVALID_PASSWORD);
    if (data.confirmacion !== data.contrasena) throw new BadRequestError(Messages.PASSWORD_MISMATCH);
    if (data.esSocioGym !== undefined && typeof data.esSocioGym !== "boolean") {
        throw new BadRequestError(Messages.INVALID_MEMBER_FLAG);
    }
    return { nombre, apellido, email, telefono, contrasena: data.contrasena, esSocioGym: data.esSocioGym ?? false };
}
