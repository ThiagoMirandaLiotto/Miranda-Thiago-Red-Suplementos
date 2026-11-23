import { CircleAlert, ShoppingBasket, X } from "lucide-react";
import Button from "../ui/Button.jsx";
import CampoCantidad from "../ui/CampoCantidad.jsx";
import ResumenImportes from "./ResumenImportes.jsx";
import { formatPrecio } from "../../utils/formatters.js";
import styles from "./CarritoPedido.module.css";

// Carrito del pedido en armado. Cantidades, subtotales, descuento y total vienen de la API,
// que controla el stock en cada cambio (RN-01) y avisa si algo dejó de estar disponible.
export default function CarritoPedido({ carrito, ocupado, onCambiarCantidad, onQuitar, onVaciar }) {
    const { items } = carrito;
    return (
        <section id="carrito" className={styles.carrito} aria-labelledby="carrito-titulo" tabIndex={-1}>
            <div className={styles.cabecera}>
                <h2 id="carrito-titulo" className={styles.titulo}>
                    Carrito{items.length ? <span className={`${styles.cuenta} tabular`}> · {carrito.unidades} u.</span> : null}
                </h2>
                {items.length ? (
                    <Button variant="ghost" onClick={onVaciar} disabled={ocupado !== null}>Vaciar</Button>
                ) : null}
            </div>

            {items.length === 0 ? (
                <div className={styles.vacio}>
                    <ShoppingBasket size={24} aria-hidden="true" />
                    <p>Todavía no agregaste productos. Elegilos de la lista: cada unidad se controla contra el stock real.</p>
                </div>
            ) : (
                <ul className={styles.lista}>
                    {items.map((item) => (
                        <li key={item.idProducto} className={styles.item} data-problema={item.problema ? "true" : undefined}>
                            <div className={styles.datos}>
                                <span className={styles.nombre}>{item.nombre}</span>
                                <span className={`${styles.extra} tabular`}>{formatPrecio(item.precioUnitario)} c/u</span>
                                {item.problema ? (
                                    <p className={styles.problema}>
                                        <CircleAlert size={16} aria-hidden="true" />
                                        <span>{item.problema}</span>
                                    </p>
                                ) : null}
                            </div>
                            <CampoCantidad
                                valor={item.cantidad}
                                max={item.stockDisponible}
                                onCambiar={(cantidad) => onCambiarCantidad(item, cantidad)}
                                etiqueta={`Cantidad de ${item.nombre}`}
                                deshabilitado={ocupado !== null || item.stockDisponible === 0}
                            />
                            <span className={`${styles.subtotal} tabular`}>{formatPrecio(item.subtotal)}</span>
                            <button
                                type="button"
                                className={styles.quitar}
                                onClick={() => onQuitar(item)}
                                disabled={ocupado !== null}
                                aria-label={`Quitar ${item.nombre} del carrito`}
                            >
                                <X size={18} aria-hidden="true" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {items.length ? <ResumenImportes {...carrito} /> : null}
        </section>
    );
}
