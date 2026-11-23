import { BadRequestError } from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TELEFONO = /^\d{8,15}$/;
const USUARIO_INSTAGRAM = /^@?([A-Za-z0-9._]{1,30})$/;

// El cuerpo debe ser un objeto JSON y traer solo los campos que acepta la ruta.
export function asegurarObjeto(data, permitidos) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new BadRequestError(Messages.INVALID_DATA);
    }
    if (Object.keys(data).some((campo) => !permitidos.includes(campo))) {
        throw new BadRequestError(Messages.FIELDS_NOT_ALLOWED);
    }
}

// Texto sin espacios de más, o null si no es un texto o no respeta los largos.
export function leerTexto(valor, { min = 1, max }) {
    if (typeof valor !== "string") return null;
    const limpio = valor.trim().replace(/\s+/g, " ");
    return limpio.length >= min && limpio.length <= max ? limpio : null;
}

// V-02: formato nombre@dominio.com. Se guarda en minúsculas para que la unicidad no dependa de mayúsculas.
export function leerEmail(valor) {
    if (typeof valor !== "string") return null;
    const email = valor.trim().toLowerCase();
    return email.length <= 254 && EMAIL.test(email) ? email : null;
}

// V-07: solo dígitos, entre 8 y 15.
export function leerTelefono(valor) {
    if (typeof valor !== "string") return null;
    const telefono = valor.trim();
    return TELEFONO.test(telefono) ? telefono : null;
}

// V-03: entre 8 y 128 caracteres, con al menos una letra y un número.
export function contrasenaValida(valor) {
    return typeof valor === "string"
        && valor.length >= 8 && valor.length <= 128
        && /\p{L}/u.test(valor) && /\d/.test(valor);
}

// Contacto de quien pide por Instagram y no tiene cuenta: usuario de Instagram o teléfono.
export function leerContacto(valor) {
    if (typeof valor !== "string") return null;
    const limpio = valor.trim();
    if (TELEFONO.test(limpio)) return limpio;
    const usuario = USUARIO_INSTAGRAM.exec(limpio);
    return usuario ? `@${usuario[1].toLowerCase()}` : null;
}

export function enteroPositivo(valor) {
    return Number.isSafeInteger(valor) && valor > 0;
}
