import { useSearchParams } from "react-router";
import { PackageOpen, SearchX } from "lucide-react";
import ProductoFiltros from "../components/productos/ProductoFiltros.jsx";
import ProductoCard from "../components/productos/ProductoCard.jsx";
import Button from "../components/ui/Button.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import InstagramIcon from "../components/ui/InstagramIcon.jsx";
import { useProductos } from "../hooks/useProductos.js";
import { useReveal } from "../hooks/useReveal.js";
import { useCategorias } from "../hooks/useCategorias.js";
import { filtrarProductos, filtrosDesdeParams, marcasDisponibles, paramsDesdeFiltros } from "../utils/filtrarProductos.js";
import { nombreCategoria } from "../utils/categorias.js";
import { urlMensajeDirecto } from "../utils/instagram.js";
import styles from "./CatalogoPage.module.css";

export default function CatalogoPage() {
    const ref = useReveal();
    const productos = useProductos();
    const categorias = useCategorias();
    const [params, setParams] = useSearchParams();
    const filtros = filtrosDesdeParams(params);

    const cargando = productos.status === "loading" || categorias.status === "loading";
    const fallo = productos.status === "error" || categorias.status === "error";
    const visibles = filtrarProductos(productos.productos, filtros, categorias.mapaCategorias);

    function cambiar(campo, valor) {
        setParams(paramsDesdeFiltros({ ...filtros, [campo]: valor }), { replace: true });
    }

    function limpiar() {
        setParams(new URLSearchParams(), { replace: true });
    }

    function reintentar() {
        if (productos.status === "error") productos.recargar();
        if (categorias.status === "error") categorias.recargar();
    }

    let contenido;
    if (cargando) {
        contenido = (
            <div className={styles.grilla} role="status">
                <span className="visually-hidden">Cargando productos…</span>
                {[0, 1, 2, 3, 4, 5].map((numero) => (
                    <div key={numero} className={styles.esqueleto}>
                        <Skeleton ratio="1" />
                        <Skeleton width="80%" height="1.4rem" />
                        <Skeleton width="55%" height="1rem" />
                        <Skeleton width="100%" height="48px" />
                    </div>
                ))}
            </div>
        );
    } else if (fallo) {
        contenido = <ErrorState titulo="No pudimos cargar el catálogo" error={productos.error ?? categorias.error} onRetry={reintentar} />;
    } else if (productos.productos.length === 0) {
        contenido = (
            <EmptyState
                icon={<PackageOpen size={28} />}
                titulo="Estamos actualizando el catálogo"
                accion={<Button href={urlMensajeDirecto()} icon={<InstagramIcon />}>Escribinos por Instagram</Button>}
            >
                <p>Escribinos y te contamos qué hay hoy en el mostrador.</p>
            </EmptyState>
        );
    } else if (visibles.length === 0) {
        contenido = (
            <EmptyState
                icon={<SearchX size={28} />}
                titulo="Ningún producto coincide con la búsqueda"
                accion={<Button variant="secondary" onClick={limpiar}>Limpiar filtros</Button>}
            >
                <p>Probá con otra palabra o quitá algún filtro.</p>
            </EmptyState>
        );
    } else {
        contenido = (
            <div className={styles.grilla}>
                {visibles.map((producto, indice) => (
                    <ProductoCard
                        key={producto.idProducto}
                        as="h2"
                        className={styles.tarjeta}
                        style={{ "--i": Math.min(indice, 7) }}
                        producto={producto}
                        categoria={nombreCategoria(categorias.mapaCategorias, producto.idCategoria)}
                    />
                ))}
            </div>
        );
    }

    return (
        <>
            <title>Catálogo · RED Suplementos</title>
            <header className={`${styles.encabezado} on-field`}>
                <h1 className="display linea-carga">
                    <span className="linea"><span>Catálogo</span></span>
                </h1>
                <p className={styles.lead}>Todos los productos de la tienda, con precio y disponibilidad al día.</p>
            </header>

            <div ref={ref} className={styles.cuerpo}>
                <div className="reveal">
                    <ProductoFiltros
                        filtros={filtros}
                        onCambiar={cambiar}
                        onLimpiar={limpiar}
                        categorias={categorias.categorias}
                        marcas={marcasDisponibles(productos.productos)}
                        resultados={visibles.length}
                        cargando={cargando}
                    />
                </div>

                <div aria-busy={cargando}>{contenido}</div>
            </div>
        </>
    );
}
