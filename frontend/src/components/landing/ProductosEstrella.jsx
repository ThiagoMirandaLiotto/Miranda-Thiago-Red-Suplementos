import { useMemo } from "react";
import { PackageOpen } from "lucide-react";
import ProductoDestacado from "../productos/ProductoDestacado.jsx";
import ProductoCard from "../productos/ProductoCard.jsx";
import IndiceCategorias from "../productos/IndiceCategorias.jsx";
import Button from "../ui/Button.jsx";
import EmptyState from "../ui/EmptyState.jsx";
import ErrorState from "../ui/ErrorState.jsx";
import Revelar from "../ui/Revelar.jsx";
import Skeleton from "../ui/Skeleton.jsx";
import InstagramIcon from "../ui/InstagramIcon.jsx";
import { useProductos } from "../../hooks/useProductos.js";
import { useCategorias } from "../../hooks/useCategorias.js";
import { seleccionarDestacados } from "../../utils/destacados.js";
import { nombreCategoria } from "../../utils/categorias.js";
import { urlMensajeDirecto } from "../../utils/instagram.js";
import fotoGrande from "../../assets/img/suplementos-mostrador-660.webp";
import fotoChica from "../../assets/img/suplementos-mostrador-440.webp";
import styles from "./ProductosEstrella.module.css";

// "Productos estrella" del boceto: un destacado y una grilla de 3 de otras categorías.
// La foto real del stock acompaña a la grilla, y el índice de categorías cierra la sección.
export default function ProductosEstrella() {
    const productos = useProductos();
    const categorias = useCategorias();
    const { destacado, grilla } = useMemo(() => seleccionarDestacados(productos.productos), [productos.productos]);

    const cargando = productos.status === "loading" || categorias.status === "loading";
    const fallo = productos.status === "error" || categorias.status === "error";

    function reintentar() {
        if (productos.status === "error") productos.recargar();
        if (categorias.status === "error") categorias.recargar();
    }

    let contenido;
    if (cargando) {
        contenido = <EsqueletoProductos />;
    } else if (fallo) {
        contenido = (
            <ErrorState
                as="h3"
                titulo="No pudimos cargar los productos"
                error={productos.error ?? categorias.error}
                onRetry={reintentar}
            />
        );
    } else if (!destacado) {
        contenido = (
            <EmptyState
                as="h3"
                icon={<PackageOpen size={28} />}
                titulo="Estamos actualizando el catálogo"
                accion={<Button href={urlMensajeDirecto()} icon={<InstagramIcon />}>Escribinos por Instagram</Button>}
            >
                <p>Escribinos y te contamos qué hay hoy en el mostrador.</p>
            </EmptyState>
        );
    } else {
        contenido = (
            <>
                <Revelar>
                    <ProductoDestacado
                        producto={destacado}
                        categoria={nombreCategoria(categorias.mapaCategorias, destacado.idCategoria)}
                    />
                </Revelar>
                <Revelar className={styles.grilla}>
                    <figure className={styles.mostrador}>
                        <div className={`${styles.mostradorFoto} reveal-corte`}>
                            <img
                                src={fotoGrande}
                                srcSet={`${fotoChica} 440w, ${fotoGrande} 660w`}
                                sizes="(min-width: 1100px) 24vw, (min-width: 720px) 48vw, 100vw"
                                width="660"
                                height="825"
                                alt="Suplementos de la tienda apilados sobre discos de pesas: proteínas, creatinas, aminoácidos y barras."
                                loading="lazy"
                                decoding="async"
                            />
                        </div>
                        <figcaption className={styles.pie}>Parte del stock de la tienda, sobre los discos del gimnasio.</figcaption>
                    </figure>
                    {grilla.map((producto, indice) => (
                        <ProductoCard
                            key={producto.idProducto}
                            className="reveal"
                            style={{ "--i": indice + 1 }}
                            producto={producto}
                            categoria={nombreCategoria(categorias.mapaCategorias, producto.idCategoria)}
                        />
                    ))}
                </Revelar>
                <IndiceCategorias categorias={categorias.categorias} productos={productos.productos} />
            </>
        );
    }

    return (
        <section id="productos" className={styles.seccion} aria-labelledby="productos-titulo">
            <Revelar className={styles.encabezado}>
                <h2 id="productos-titulo" className={`${styles.titulo} display`}>
                    <span className="linea"><span>Productos</span></span>
                    <span className="linea"><span style={{ "--i": 1 }}>estrella</span></span>
                </h2>
                <p className={`${styles.lead} reveal`} style={{ "--i": 2 }}>
                    Una selección de lo que hay en el mostrador, con precio y disponibilidad al día.
                </p>
            </Revelar>

            <div className={styles.productos} aria-busy={cargando}>
                {contenido}
            </div>
        </section>
    );
}

function EsqueletoProductos() {
    return (
        <div className={styles.esqueleto} role="status">
            <span className="visually-hidden">Cargando productos…</span>
            <div className={styles.esqueletoDestacado}>
                <Skeleton ratio="1" />
                <div className={styles.esqueletoTexto}>
                    <Skeleton width="70%" height="2.25rem" />
                    <Skeleton width="45%" height="1.1rem" />
                    <Skeleton width="85%" height="1.1rem" />
                    <Skeleton width="40%" height="2.25rem" />
                    <Skeleton width="100%" height="60px" />
                </div>
            </div>
            <div className={styles.grilla}>
                {[0, 1, 2, 3].map((numero) => (
                    <div key={numero} className={styles.esqueletoCard}>
                        <Skeleton ratio="1" />
                        <Skeleton width="80%" height="1.4rem" />
                        <Skeleton width="50%" height="1rem" />
                        <Skeleton width="100%" height="48px" />
                    </div>
                ))}
            </div>
        </div>
    );
}
