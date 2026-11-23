import { Check } from "lucide-react";
import { ESTADO, ETIQUETA_ESTADO } from "../../utils/pedidos.js";
import styles from "./PasosPedido.module.css";

const PASOS = [ESTADO.PENDIENTE, ESTADO.LISTO_PARA_RETIRAR, ESTADO.ENTREGADO];

// Recorrido normal del pedido: dónde está y qué falta. Cancelado y vencido salen del recorrido.
export default function PasosPedido({ estado }) {
    const actual = PASOS.indexOf(estado);
    return (
        <ol className={styles.pasos} aria-label="Estado del pedido">
            {PASOS.map((paso, indice) => {
                const hecho = indice < actual || estado === ESTADO.ENTREGADO;
                const esActual = indice === actual;
                return (
                    <li
                        key={paso}
                        className={styles.paso}
                        data-estado={hecho ? "hecho" : esActual ? "actual" : "pendiente"}
                        aria-current={esActual ? "step" : undefined}
                    >
                        <span className={styles.marca} aria-hidden="true">
                            {hecho ? <Check size={16} strokeWidth={3} /> : indice + 1}
                        </span>
                        <span className={styles.texto}>{ETIQUETA_ESTADO[paso]}</span>
                    </li>
                );
            })}
        </ol>
    );
}
