import { Pencil, Trash2 } from "lucide-react";
import ProductoImagen from "./ProductoImagen.jsx";
import StockBadge from "./StockBadge.jsx";
import Button from "../ui/Button.jsx";
import { nombreCategoria } from "../../utils/categorias.js";
import { formatPrecio } from "../../utils/formatters.js";
import styles from "./ProductoTabla.module.css";

function Acciones({ producto, onDarDeBaja }) {
    return (
        <div className={styles.acciones}>
            <Button
                to={`/admin/productos/${producto.idProducto}/editar`}
                variant="tonal"
                icon={<Pencil size={16} aria-hidden="true" />}
                aria-label={`Editar ${producto.nombre}`}
            >
                Editar
            </Button>
            <Button
                variant="dangerGhost"
                icon={<Trash2 size={16} aria-hidden="true" />}
                aria-label={`Dar de baja ${producto.nombre}`}
                onClick={() => onDarDeBaja(producto)}
            >
                Dar de baja
            </Button>
        </div>
    );
}

function Detalle({ producto }) {
    const detalle = [producto.marca, producto.sabor].filter(Boolean).join(", ");
    return detalle ? <span className={styles.detalle}>{detalle}</span> : null;
}

// Tabla en pantallas anchas y lista de tarjetas en el teléfono.
// La versión que no corresponde queda con display: none, fuera del árbol de accesibilidad.
export default function ProductoTabla({ productos, mapaCategorias, onDarDeBaja }) {
    return (
        <>
            <table className={styles.tabla}>
                <caption className="visually-hidden">Productos activos del catálogo</caption>
                <thead>
                    <tr>
                        <th scope="col">Producto</th>
                        <th scope="col">Categoría</th>
                        <th scope="col" className={styles.numero}>Precio</th>
                        <th scope="col">Stock</th>
                        <th scope="col"><span className="visually-hidden">Acciones</span></th>
                    </tr>
                </thead>
                <tbody>
                    {productos.map((producto) => (
                        <tr key={producto.idProducto}>
                            <th scope="row">
                                <div className={styles.producto}>
                                    <div className={styles.miniatura}>
                                        <ProductoImagen key={producto.imagen} producto={producto} categoria={nombreCategoria(mapaCategorias, producto.idCategoria)} />
                                    </div>
                                    <div className={styles.textos}>
                                        <span className={styles.nombre}>{producto.nombre}</span>
                                        <Detalle producto={producto} />
                                    </div>
                                </div>
                            </th>
                            <td>{nombreCategoria(mapaCategorias, producto.idCategoria)}</td>
                            <td className={`${styles.numero} tabular`}>{formatPrecio(producto.precio)}</td>
                            <td>
                                <div className={styles.stock}>
                                    <span className="tabular">
                                        <strong>{producto.stock}</strong> <span className={styles.minimo}>/ mín. {producto.stockMinimo}</span>
                                    </span>
                                    <StockBadge producto={producto} contexto="panel" />
                                </div>
                            </td>
                            <td><Acciones producto={producto} onDarDeBaja={onDarDeBaja} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <ul className={styles.lista} aria-label="Productos activos del catálogo">
                {productos.map((producto) => (
                    <li key={producto.idProducto} className={styles.item}>
                        <div className={styles.producto}>
                            <div className={styles.miniatura}>
                                <ProductoImagen key={producto.imagen} producto={producto} categoria={nombreCategoria(mapaCategorias, producto.idCategoria)} />
                            </div>
                            <div className={styles.textos}>
                                <span className={styles.nombre}>{producto.nombre}</span>
                                <Detalle producto={producto} />
                                <span className={styles.detalle}>{nombreCategoria(mapaCategorias, producto.idCategoria)}</span>
                            </div>
                        </div>
                        <dl className={styles.datos}>
                            <div>
                                <dt>Precio</dt>
                                <dd className="tabular">{formatPrecio(producto.precio)}</dd>
                            </div>
                            <div>
                                <dt>Stock</dt>
                                <dd className="tabular">{producto.stock} <span className={styles.minimo}>/ mín. {producto.stockMinimo}</span></dd>
                            </div>
                            <div>
                                <dt className="visually-hidden">Estado</dt>
                                <dd><StockBadge producto={producto} contexto="panel" /></dd>
                            </div>
                        </dl>
                        <Acciones producto={producto} onDarDeBaja={onDarDeBaja} />
                    </li>
                ))}
            </ul>
        </>
    );
}
