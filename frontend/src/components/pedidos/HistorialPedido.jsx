import EstadoPedidoBadge from "./EstadoPedidoBadge.jsx";
import { formatFechaHora } from "../../utils/fechas.js";
import { ROL } from "../../utils/constants.js";
import styles from "./HistorialPedido.module.css";

function quien(cambio) {
    if (cambio.idUsuario === null) return "automático, a las 48 h de la franja";
    if (cambio.rol === ROL.CLIENTE) return "desde la cuenta del cliente";
    return `por ${cambio.nombreUsuario}`;
}

// Quién cambió cada estado y cuándo (Anexo B: Administrador → Pedido gestionado).
export default function HistorialPedido({ historial }) {
    return (
        <ol className={styles.historial}>
            {historial.map((cambio, indice) => (
                <li key={`${cambio.estado}-${indice}`} className={styles.cambio}>
                    <EstadoPedidoBadge estado={cambio.estado} />
                    <p className={styles.detalle}>
                        <time dateTime={cambio.fecha} className="tabular">{formatFechaHora(cambio.fecha)}</time>
                        {" · "}
                        {quien(cambio)}
                    </p>
                    {cambio.nota ? <p className={styles.nota}>«{cambio.nota}»</p> : null}
                </li>
            ))}
        </ol>
    );
}
