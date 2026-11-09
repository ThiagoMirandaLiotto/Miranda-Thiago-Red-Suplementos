import { useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import ProductoImagen from "./ProductoImagen.jsx";
import Revelar from "../ui/Revelar.jsx";
import { useSeguirPuntero } from "../../hooks/usePuntero.js";
import { formatCantidad } from "../../utils/formatters.js";
import styles from "./IndiceCategorias.module.css";

// Elige qué mostrar en la vista previa: un producto con foto si lo hay; si no, cualquiera de la categoría.
function muestraDe(categoria, productos) {
    const propios = productos.filter((producto) => producto.idCategoria === categoria.idCategoria);
    const muestra = propios.find((producto) => producto.imagen) ?? propios[0]
        ?? { idCategoria: categoria.idCategoria, nombre: categoria.nombre, marca: "", imagen: "" };
    return { categoria, muestra, cantidad: propios.length };
}

// Las categorías como una pared de texto. Al señalar una fila, el negro la barre y su producto
// aparece junto al puntero. En pantallas táctiles cada fila lleva la imagen en su lugar.
export default function IndiceCategorias({ categorias, productos }) {
    const [activa, setActiva] = useState(categorias[0]?.idCategoria);
    const { contenedorRef, marcoRef } = useSeguirPuntero();
    const filas = useMemo(() => categorias.map((categoria) => muestraDe(categoria, productos)), [categorias, productos]);

    return (
        <Revelar className={styles.envoltura}>
            <nav className={styles.indice} aria-label="Categorías">
                <div ref={contenedorRef} className={styles.caja}>
                    <ul className={styles.filas}>
                        {filas.map(({ categoria, muestra, cantidad }, indice) => (
                            <li key={categoria.idCategoria} className="reveal" style={{ "--i": indice }}>
                                <Link
                                    to={`/catalogo?categoria=${categoria.idCategoria}`}
                                    className={styles.fila}
                                    onPointerEnter={() => setActiva(categoria.idCategoria)}
                                >
                                    <span className={styles.miniatura} aria-hidden="true">
                                        <ProductoImagen key={muestra.imagen} producto={muestra} categoria={categoria.nombre} />
                                    </span>
                                    <span className={`${styles.nombre} display`}>{categoria.nombre}</span>
                                    <span className={`${styles.cantidad} tabular`}>{formatCantidad(cantidad, "producto", "productos")}</span>
                                    <ArrowRight className={styles.flecha} size={28} aria-hidden="true" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <div ref={marcoRef} className={styles.marco} aria-hidden="true">
                        {filas.map(({ categoria, muestra }) => (
                            <div key={categoria.idCategoria} className={styles.vista} data-activa={categoria.idCategoria === activa}>
                                <ProductoImagen key={muestra.imagen} producto={muestra} categoria={categoria.nombre} />
                            </div>
                        ))}
                    </div>
                </div>
                <Link to="/catalogo" className={`${styles.verTodos} reveal`} style={{ "--i": filas.length }}>
                    Ver los {formatCantidad(productos.length, "producto", "productos")}
                    <ArrowRight size={20} aria-hidden="true" />
                </Link>
            </nav>
        </Revelar>
    );
}
