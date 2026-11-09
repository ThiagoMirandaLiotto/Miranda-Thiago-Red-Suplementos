import ProductoImagen from "./ProductoImagen.jsx";
import StockBadge from "./StockBadge.jsx";
import BotonComprar from "./BotonComprar.jsx";
import Button from "../ui/Button.jsx";
import EnlaceProducto from "./EnlaceProducto.jsx";
import { useInclinacion } from "../../hooks/usePuntero.js";
import { formatPrecio } from "../../utils/formatters.js";
import styles from "./ProductoDestacado.module.css";

// El destacado del boceto: imagen a la izquierda; nombre, texto y compra a la derecha.
export default function ProductoDestacado({ producto, categoria }) {
    const tituloId = `destacado-${producto.idProducto}`;
    const imagenRef = useInclinacion();

    return (
        <article className={styles.destacado} aria-labelledby={tituloId}>
            {/* La imagen repite el enlace del nombre para el mouse; teclado y lector usan solo el del nombre. */}
            <EnlaceProducto producto={producto} categoria={categoria} className={`${styles.placa} reveal-corte`} tabIndex={-1} aria-hidden="true">
                <div ref={imagenRef} className={styles.inclinable} data-vt-imagen>
                    <ProductoImagen key={producto.imagen} producto={producto} categoria={categoria} prioridad />
                </div>
            </EnlaceProducto>
            <div className={styles.texto}>
                <div className="reveal" style={{ "--i": 2 }}>
                    <h3 id={tituloId} className={styles.nombre}>
                        <EnlaceProducto producto={producto} categoria={categoria} className={styles.enlace}>
                            {producto.nombre}
                        </EnlaceProducto>
                    </h3>
                    <dl className={styles.datos}>
                        <div>
                            <dt>Categoría</dt>
                            <dd>{categoria}</dd>
                        </div>
                        {producto.marca ? (
                            <div>
                                <dt>Marca</dt>
                                <dd>{producto.marca}</dd>
                            </div>
                        ) : null}
                        {producto.sabor ? (
                            <div>
                                <dt>Sabor</dt>
                                <dd>{producto.sabor}</dd>
                            </div>
                        ) : null}
                    </dl>
                    {producto.descripcion ? <p className={styles.descripcion}>{producto.descripcion}</p> : null}
                </div>
                <div className={`${styles.compra} reveal`} style={{ "--i": 4 }}>
                    <div className={styles.precioFila}>
                        <p className={`${styles.precio} tabular`}>{formatPrecio(producto.precio)}</p>
                        <StockBadge producto={producto} />
                    </div>
                    <div className={styles.acciones}>
                        <BotonComprar producto={producto} size="lg" fullWidth />
                        <Button to="/catalogo" variant="tonal" size="lg" fullWidth>Ver catálogo</Button>
                    </div>
                </div>
            </div>
        </article>
    );
}
