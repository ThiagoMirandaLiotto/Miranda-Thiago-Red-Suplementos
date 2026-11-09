import { CircleAlert, CircleCheck, PackageOpen } from "lucide-react";
import Badge from "../ui/Badge.jsx";
import { ESTADO_STOCK, estadoStock } from "../../utils/stock.js";

const PUBLICO = {
    [ESTADO_STOCK.DISPONIBLE]: { tono: "success", texto: "Disponible", Icono: CircleCheck },
    [ESTADO_STOCK.BAJO]: { tono: "warning", texto: "Últimas unidades", Icono: CircleAlert },
    [ESTADO_STOCK.SIN_STOCK]: { tono: "danger", texto: "Sin stock", Icono: PackageOpen }
};

const PANEL = {
    [ESTADO_STOCK.DISPONIBLE]: { tono: "success", texto: "Disponible", Icono: CircleCheck },
    [ESTADO_STOCK.BAJO]: { tono: "warning", texto: "Stock bajo", Icono: CircleAlert },
    [ESTADO_STOCK.SIN_STOCK]: { tono: "danger", texto: "Sin stock", Icono: PackageOpen }
};

// En el sitio público se habla de disponibilidad; en el panel, del stock contra el mínimo.
export default function StockBadge({ producto, contexto = "publico" }) {
    const { tono, texto, Icono } = (contexto === "panel" ? PANEL : PUBLICO)[estadoStock(producto)];
    return <Badge tono={tono} icon={<Icono size={16} aria-hidden="true" />}>{texto}</Badge>;
}
