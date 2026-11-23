import { BadRequestError } from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";
import { Negocio } from "../enums/Negocio.js";
import { TipoMovimiento } from "../enums/TipoMovimiento.js";
import { asegurarObjeto, leerTexto } from "./validarCuerpo.js";

// Movimientos manuales (F-06): ingreso de mercadería o ajuste de inventario con su motivo.
export default function validateMovimiento(data) {
    asegurarObjeto(data, ["tipo", "cantidad", "observacion"]);
    const { tipo, cantidad } = data;
    if (tipo !== TipoMovimiento.INGRESO && tipo !== TipoMovimiento.AJUSTE) {
        throw new BadRequestError(Messages.INVALID_MOVEMENT_TYPE);
    }
    const tope = Negocio.maxUnidadesMovimiento;
    if (tipo === TipoMovimiento.INGRESO) {
        if (!Number.isSafeInteger(cantidad) || cantidad < 1 || cantidad > tope) {
            throw new BadRequestError(Messages.INVALID_INCOME_QUANTITY);
        }
        const texto = data.observacion ?? "";
        if (typeof texto !== "string" || texto.trim().length > 200) {
            throw new BadRequestError(Messages.INVALID_OBSERVATION);
        }
        return { tipo, cantidad, observacion: leerTexto(texto, { max: 200 }) ?? "Ingreso de mercadería" };
    }
    if (!Number.isSafeInteger(cantidad) || cantidad === 0 || Math.abs(cantidad) > tope) {
        throw new BadRequestError(Messages.INVALID_ADJUSTMENT_QUANTITY);
    }
    const observacion = leerTexto(data.observacion, { min: 3, max: 200 });
    if (!observacion) throw new BadRequestError(Messages.ADJUSTMENT_REASON_REQUIRED);
    return { tipo, cantidad, observacion };
}
