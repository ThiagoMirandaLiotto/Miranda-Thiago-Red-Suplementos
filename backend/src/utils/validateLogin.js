import { BadRequestError } from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";
import { asegurarObjeto } from "./validarCuerpo.js";

// Solo exige que lleguen los dos datos: si el formato está mal, el login falla igual que con una clave incorrecta.
export default function validateLogin(data) {
    asegurarObjeto(data, ["email", "contrasena"]);
    if (typeof data.email !== "string" || !data.email.trim()
        || typeof data.contrasena !== "string" || !data.contrasena
        || data.email.length > 254 || data.contrasena.length > 128) {
        throw new BadRequestError(Messages.MISSING_CREDENTIALS);
    }
    return { email: data.email.trim().toLowerCase(), contrasena: data.contrasena };
}
