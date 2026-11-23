import { formatPrecio } from "../../utils/formatters.js";
import styles from "./DetalleProductos.module.css";

// Líneas del pedido con el precio del momento de la compra (no cambian si después cambia el catálogo).
export default function DetalleProductos({ detalles, titulo = "Productos del pedido" }) {
    return (
        <table className={styles.tabla}>
            <caption className="visually-hidden">{titulo}</caption>
            <thead>
                <tr>
                    <th scope="col">Producto</th>
                    <th scope="col" className={styles.numero}>Cantidad</th>
                    <th scope="col" className={`${styles.numero} ${styles.unitario}`}>Precio</th>
                    <th scope="col" className={styles.numero}>Subtotal</th>
                </tr>
            </thead>
            <tbody>
                {detalles.map((detalle) => {
                    const extra = [detalle.marca, detalle.sabor].filter(Boolean).join(", ");
                    return (
                        <tr key={detalle.idDetalle ?? detalle.idProducto}>
                            <th scope="row">
                                <span className={styles.nombre}>{detalle.nombre}</span>
                                {extra ? <span className={styles.extra}>{extra}</span> : null}
                                <span className={`${styles.extra} ${styles.unitarioMovil} tabular`}>
                                    {formatPrecio(detalle.precioUnitario)} c/u
                                </span>
                            </th>
                            <td className={`${styles.numero} tabular`}>{detalle.cantidad}</td>
                            <td className={`${styles.numero} ${styles.unitario} tabular`}>{formatPrecio(detalle.precioUnitario)}</td>
                            <td className={`${styles.numero} tabular`}>{formatPrecio(detalle.subtotal)}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}
