import { formatPrecio } from "../../utils/formatters.js";
import styles from "./RankingProductos.module.css";

// Productos más vendidos: una fila por producto con su barra, de mayor a menor, en un solo tono.
// El número de unidades está escrito en cada fila: la barra solo ayuda a comparar.
export default function RankingProductos({ productos }) {
    const maximo = Math.max(...productos.map((producto) => producto.unidades), 1);
    return (
        <ol className={styles.ranking}>
            {productos.map((producto) => {
                const detalle = [producto.marca, producto.sabor].filter(Boolean).join(", ");
                return (
                    <li key={producto.idProducto} className={styles.fila}>
                        <span className={styles.nombre}>
                            {producto.nombre}
                            {detalle ? <span className={styles.detalle}>{detalle}</span> : null}
                        </span>
                        <span className={styles.pista} aria-hidden="true">
                            <span className={styles.barra} style={{ "--proporcion": producto.unidades / maximo }} />
                        </span>
                        <span className={styles.cifras}>
                            <strong className="tabular">{producto.unidades} u.</strong>
                            <span className="tabular">{formatPrecio(producto.importe)}</span>
                        </span>
                    </li>
                );
            })}
        </ol>
    );
}
