import { useRef } from "react";
import ProductoImagen from "./ProductoImagen.jsx";
import StockBadge from "./StockBadge.jsx";
import BotonComprar from "./BotonComprar.jsx";
import EnlaceProducto from "./EnlaceProducto.jsx";
import { formatPrecio } from "../../utils/formatters.js";
import styles from "./ProductoCard.module.css";

// Tarjeta pública: se usa en "Productos estrella", en el catálogo y en la página de producto.
// El enlace es el nombre. Un clic en cualquier otra parte de la tarjeta lo repite, sin poner una capa
// encima del texto: se sigue pudiendo seleccionar, y "Comprar" sigue siendo su propio botón.
export default function ProductoCard({ producto, categoria, as: Titulo = "h3", className = "", style }) {
    const enlaceRef = useRef(null);
    const tituloId = `producto-${producto.idProducto}`;
    const detalle = [producto.marca, producto.sabor].filter(Boolean).join(", ");

    function alTocarTarjeta(event) {
        if (event.target.closest("a, button")) return;
        if (window.getSelection()?.toString()) return;
        enlaceRef.current?.click();
    }

    return (
        <article className={`${styles.card} ${className}`} style={style} aria-labelledby={tituloId} onClick={alTocarTarjeta}>
            <div data-vt-imagen>
                <ProductoImagen key={producto.imagen} producto={producto} categoria={categoria} />
            </div>
            <div className={styles.cuerpo}>
                <Titulo id={tituloId} className={styles.nombre}>
                    <EnlaceProducto ref={enlaceRef} producto={producto} categoria={categoria} className={styles.enlace}>
                        {producto.nombre}
                    </EnlaceProducto>
                </Titulo>
                <p className={styles.detalle}>
                    {detalle ? `${detalle}. ` : ""}{categoria}
                </p>
                <div className={styles.fila}>
                    <p className={`${styles.precio} tabular`}>{formatPrecio(producto.precio)}</p>
                    <StockBadge producto={producto} />
                </div>
                <BotonComprar producto={producto} fullWidth />
            </div>
        </article>
    );
}
