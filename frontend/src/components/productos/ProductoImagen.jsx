import { useState } from "react";
import PlacaProducto from "./PlacaProducto.jsx";
import styles from "./ProductoImagen.module.css";

// Foto del producto si la API trae una que carga; si no, la placa dibujada de su categoría.
// Quien la usa le pone key={producto.imagen} para reintentar cuando cambia la URL.
export default function ProductoImagen({ producto, categoria, prioridad = false }) {
    const [fallo, setFallo] = useState(false);

    return (
        <div className={styles.marco}>
            {producto.imagen && !fallo ? (
                <img
                    className={styles.foto}
                    data-zoom
                    src={producto.imagen}
                    alt={[producto.nombre, producto.marca].filter(Boolean).join(", ")}
                    width="600"
                    height="600"
                    loading={prioridad ? "eager" : "lazy"}
                    decoding="async"
                    onError={() => setFallo(true)}
                />
            ) : (
                <PlacaProducto idCategoria={producto.idCategoria} categoria={categoria} marca={producto.marca} />
            )}
        </div>
    );
}
