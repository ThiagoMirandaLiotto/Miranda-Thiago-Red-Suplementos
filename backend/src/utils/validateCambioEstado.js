import { BadRequestError } from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";
import { EstadoPedido } from "../enums/EstadoPedido.js";
import { asegurarObjeto } from "./validarCuerpo.js";

// Estados a los que se llega a mano. VENCIDO lo asigna el sistema (RN-06).
const destinos = [EstadoPedido.LISTO_PARA_RETIRAR, EstadoPedido.ENTREGADO, EstadoPedido.CANCELADO];

export default function validateCambioEstado(data) {
    asegurarObjeto(data, ["estado", "motivo"]);
    if (!destinos.includes(data.estado)) throw new BadRequestError(Messages.INVALID_STATUS);
    if (data.motivo !== undefined && (typeof data.motivo !== "string" || data.motivo.trim().length > 300)) {
        throw new BadRequestError(Messages.INVALID_REASON);
    }
    return { estado: data.estado, motivo: data.motivo?.trim().replace(/\s+/g, " ") ?? "" };
}
