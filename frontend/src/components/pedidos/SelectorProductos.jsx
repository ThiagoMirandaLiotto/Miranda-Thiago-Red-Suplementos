import { useState } from "react";
import { Plus } from "lucide-react";
import Button from "../ui/Button.jsx";
import TextField from "../ui/TextField.jsx";
import StockBadge from "../productos/StockBadge.jsx";
import { nombreCategoria } from "../../utils/categorias.js";
import { formatPrecio } from "../../utils/formatters.js";
import styles from "./SelectorProductos.module.css";

function normalizar(texto) {
    return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

// Lista del catálogo para armar el pedido. "enCarrito" es un Map idProducto → unidades ya agregadas.
export default function SelectorProductos({ productos, mapaCategorias, enCarrito, ocupado, onAgregar }) {
    const [busqueda, setBusqueda] = useState("");
    const texto = normalizar(busqueda.trim());
    const visibles = productos.filter((producto) => !texto || normalizar(
        `${producto.nombre} ${producto.marca} ${producto.sabor} ${nombreCategoria(mapaCategorias, producto.idCategoria)}`
    ).includes(texto));

    return (
        <section className={styles.selector} aria-labelledby="selector-titulo">
            <h2 id="selector-titulo" className={styles.titulo}>Productos</h2>
            <div className={styles.buscador}>
                <TextField
                    label="Buscar en el catálogo"
                    type="search"
                    value={busqueda}
                    onChange={(event) => setBusqueda(event.target.value)}
                    placeholder="Nombre, marca, sabor o categoría"
                    autoComplete="off"
                />
            </div>
            {visibles.length === 0 ? (
                <p className={styles.vacio}>Ningún producto coincide con «{busqueda.trim()}».</p>
            ) : (
                <ul className={styles.lista}>
                    {visibles.map((producto) => {
                        const agregados = enCarrito.get(producto.idProducto) ?? 0;
                        const quedan = producto.stock - agregados;
                        const detalle = [producto.marca, producto.sabor].filter(Boolean).join(", ");
                        return (
                            <li key={producto.idProducto} className={styles.item}>
                                <div className={styles.datos}>
                                    <span className={styles.nombre}>{producto.nombre}</span>
                                    <span className={styles.extra}>
                                        {detalle ? `${detalle} · ` : ""}{nombreCategoria(mapaCategorias, producto.idCategoria)}
                                    </span>
                                </div>
                                <div className={styles.stock}>
                                    <span className={`${styles.precio} tabular`}>{formatPrecio(producto.precio)}</span>
                                    <span className={`${styles.extra} tabular`}>
                                        {producto.stock} en stock{agregados ? ` · ${agregados} en el carrito` : ""}
                                    </span>
                                    <StockBadge producto={producto} contexto="panel" />
                                </div>
                                <Button
                                    variant="tonal"
                                    icon={<Plus size={16} aria-hidden="true" />}
                                    onClick={() => onAgregar(producto)}
                                    loading={ocupado === producto.idProducto}
                                    loadingText="Agregando…"
                                    disabled={quedan <= 0 || (ocupado !== null && ocupado !== producto.idProducto)}
                                    aria-label={quedan <= 0 ? `${producto.nombre}: sin stock para agregar` : `Agregar una unidad de ${producto.nombre}`}
                                    className={styles.agregar}
                                >
                                    {quedan <= 0 ? "Sin stock" : "Agregar"}
                                </Button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
