import { BadRequestError } from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";

const allowedFields = ["nombre", "marca", "idCategoria", "descripcion", "precio",
    "stock", "stockMinimo", "sabor", "imagen"];

export default function validateProducto(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new BadRequestError(Messages.INVALID_DATA);
    }
    if (Object.keys(data).some((key) => !allowedFields.includes(key))) {
        throw new BadRequestError(Messages.UNKNOWN_FIELDS);
    }
    if (typeof data.nombre !== "string" || !data.nombre.trim()
        || data.nombre.trim().length > 120) {
        throw new BadRequestError(Messages.INVALID_NAME);
    }
    if (!Number.isSafeInteger(data.idCategoria) || data.idCategoria <= 0) {
        throw new BadRequestError(Messages.INVALID_CATEGORY);
    }
    if (typeof data.precio !== "number" || !Number.isFinite(data.precio)
        || data.precio <= 0 || data.precio > 1_000_000_000
        || Number(data.precio.toFixed(2)) !== data.precio) {
        throw new BadRequestError(Messages.INVALID_PRICE);
    }
    if (!Number.isSafeInteger(data.stock) || data.stock < 0) {
        throw new BadRequestError(Messages.INVALID_STOCK);
    }
    if (data.stockMinimo !== undefined
        && (!Number.isSafeInteger(data.stockMinimo) || data.stockMinimo < 0)) {
        throw new BadRequestError(Messages.INVALID_MINIMUM_STOCK);
    }
    const result = { ...data, nombre: data.nombre.trim() };
    for (const field of ["marca", "sabor", "descripcion", "imagen"]) {
        const value = data[field] ?? "";
        const limit = ["marca", "sabor"].includes(field) ? 120 : 2000;
        if (data[field] === null || typeof value !== "string" || value.trim().length > limit) {
            throw new BadRequestError(Messages.INVALID_TEXT);
        }
        result[field] = value.trim();
    }
    result.stockMinimo = data.stockMinimo ?? 0;
    return result;
}
