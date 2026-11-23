import { CircleCheck, CircleX, Clock, PackageCheck, TimerOff } from "lucide-react";
import Badge from "../ui/Badge.jsx";
import { ESTADO, ETIQUETA_ESTADO } from "../../utils/pedidos.js";

// Los estados que piden algo (preparar, retirar) resaltan; los cerrados quedan en segundo plano.
const PRESENTACION = {
    [ESTADO.PENDIENTE]: { tono: "warning", Icono: Clock },
    [ESTADO.LISTO_PARA_RETIRAR]: { tono: "success", Icono: PackageCheck },
    [ESTADO.ENTREGADO]: { tono: "neutral", Icono: CircleCheck },
    [ESTADO.CANCELADO]: { tono: "danger", Icono: CircleX },
    [ESTADO.VENCIDO]: { tono: "danger", Icono: TimerOff }
};

export default function EstadoPedidoBadge({ estado }) {
    const { tono, Icono } = PRESENTACION[estado];
    return <Badge tono={tono} icon={<Icono size={16} aria-hidden="true" />}>{ETIQUETA_ESTADO[estado]}</Badge>;
}
