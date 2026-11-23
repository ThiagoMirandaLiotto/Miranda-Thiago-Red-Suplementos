import { formatPrecio } from "../../utils/formatters.js";
import styles from "./ResumenImportes.module.css";

// Subtotal, descuento de socio (RN-09) y total, tal como los calculó la API.
export default function ResumenImportes({ subtotal, porcentajeDescuento = 0, descuento = 0, total, className = "" }) {
    return (
        <dl className={`${styles.importes} ${className}`}>
            {descuento > 0 ? (
                <>
                    <div className={styles.fila}>
                        <dt>Subtotal</dt>
                        <dd className="tabular">{formatPrecio(subtotal)}</dd>
                    </div>
                    <div className={styles.fila}>
                        <dt>Descuento socio RED GYM ({porcentajeDescuento} %)</dt>
                        <dd className="tabular">− {formatPrecio(descuento)}</dd>
                    </div>
                </>
            ) : null}
            <div className={`${styles.fila} ${styles.total}`}>
                <dt>Total</dt>
                <dd className="tabular">{formatPrecio(total)}</dd>
            </div>
        </dl>
    );
}
