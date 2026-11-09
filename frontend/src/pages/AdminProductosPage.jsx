import { useCallback, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { PackageOpen, Plus, SearchX } from "lucide-react";
import EncabezadoPanel from "../components/layout/EncabezadoPanel.jsx";
import ProductoFiltros from "../components/productos/ProductoFiltros.jsx";
import ProductoTabla from "../components/productos/ProductoTabla.jsx";
import Button from "../components/ui/Button.jsx";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import { useProductos } from "../hooks/useProductos.js";
import { useCategorias } from "../hooks/useCategorias.js";
import { deleteProducto } from "../services/productosService.js";
import { filtrarProductos, filtrosDesdeParams, paramsDesdeFiltros } from "../utils/filtrarProductos.js";
import { ESTADO_STOCK, estadoStock } from "../utils/stock.js";
import { formatCantidad } from "../utils/formatters.js";
import { mensajeDeError, notify } from "../utils/notify.js";
import styles from "./AdminPage.module.css";

function resumenStock(productos) {
    const bajos = productos.filter((producto) => estadoStock(producto) === ESTADO_STOCK.BAJO).length;
    const sinStock = productos.filter((producto) => estadoStock(producto) === ESTADO_STOCK.SIN_STOCK).length;
    const total = `${formatCantidad(productos.length, "producto activo", "productos activos")}.`;
    if (bajos === 0 && sinStock === 0) return `${total} Todos tienen stock suficiente.`;
    const partes = [];
    if (bajos > 0) partes.push(`${bajos} con stock bajo`);
    if (sinStock > 0) partes.push(`${sinStock} sin stock`);
    return `${total} ${partes.join(" y ")}.`;
}

export default function AdminProductosPage() {
    const productos = useProductos();
    const categorias = useCategorias();
    const [params, setParams] = useSearchParams();
    const filtros = filtrosDesdeParams(params);
    const [aDarDeBaja, setADarDeBaja] = useState(null);
    const [dandoDeBaja, setDandoDeBaja] = useState(false);
    const [errorBaja, setErrorBaja] = useState(null);
    const tituloRef = useRef(null);
    const enfocarTituloAlCerrar = useRef(false);

    const cargando = productos.status === "loading" || categorias.status === "loading";
    const fallo = productos.status === "error" || categorias.status === "error";
    const errorCarga = productos.error ?? categorias.error;
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

    function pedirBaja(producto) {
        setErrorBaja(null);
        setADarDeBaja(producto);
    }

    function cancelarBaja() {
        if (dandoDeBaja) return;
        setADarDeBaja(null);
        setErrorBaja(null);
    }

    async function confirmarBaja() {
        const producto = aDarDeBaja;
        setDandoDeBaja(true);
        setErrorBaja(null);
        try {
            await deleteProducto(producto.idProducto);
            // La fila desaparece: al cerrarse el diálogo, el foco va al título de la pantalla.
            enfocarTituloAlCerrar.current = true;
            productos.quitarProducto(producto.idProducto);
            setADarDeBaja(null);
            notify.success(`Diste de baja «${producto.nombre}»`, { description: "Ya no se muestra en la tienda." });
        } catch (error) {
            notify.error(error, { id: "baja-producto" });
            if (error.status === 404) {
                // Alguien ya lo había dado de baja: se cierra y se actualiza la lista.
                setADarDeBaja(null);
                productos.recargar();
            } else {
                setErrorBaja(mensajeDeError(error));
            }
        } finally {
            setDandoDeBaja(false);
        }
    }

    const alCerrarDialogo = useCallback(() => {
        if (enfocarTituloAlCerrar.current) {
            enfocarTituloAlCerrar.current = false;
            tituloRef.current?.focus();
        }
    }, []);

    let contenido;
    if (cargando) {
        contenido = (
            <div className={styles.esqueletoTabla} role="status">
                <span className="visually-hidden">Cargando productos…</span>
                {[0, 1, 2, 3, 4, 5].map((numero) => (
                    <div key={numero} className={styles.esqueletoFila}>
                        <Skeleton width="56px" ratio="1" />
                        <Skeleton width="40%" height="1.1rem" />
                        <Skeleton width="15%" height="1.1rem" />
                        <Skeleton width="20%" height="44px" />
                    </div>
                ))}
            </div>
        );
    } else if (fallo) {
        contenido = (
            <div className={styles.error}>
                <ErrorState as="h2" titulo="No pudimos cargar los productos" error={errorCarga} onRetry={reintentar} />
                {errorCarga?.status === 0 ? (
                    <p className={styles.pista}>
                        Si estás probando el panel en tu computadora, revisá que la API esté iniciada
                        (<code>npm start</code> en la carpeta <code>backend</code>).
                    </p>
                ) : null}
            </div>
        );
    } else if (productos.productos.length === 0) {
        contenido = (
            <EmptyState
                icon={<PackageOpen size={28} />}
                titulo="Todavía no hay productos"
                accion={<Button to="/admin/productos/nuevo" icon={<Plus size={18} aria-hidden="true" />}>Crear producto</Button>}
            >
                <p>Cargá el primero y va a aparecer en la tienda y en el catálogo.</p>
            </EmptyState>
        );
    } else if (visibles.length === 0) {
        contenido = (
            <EmptyState
                icon={<SearchX size={28} />}
                titulo="Ningún producto coincide con los filtros"
                accion={<Button variant="secondary" onClick={limpiar}>Limpiar filtros</Button>}
            />
        );
    } else {
        contenido = (
            <ProductoTabla productos={visibles} mapaCategorias={categorias.mapaCategorias} onDarDeBaja={pedirBaja} />
        );
    }

    return (
        <>
            <title>Productos · Panel · RED Suplementos</title>
            <EncabezadoPanel
                titulo="Productos"
                tituloRef={tituloRef}
                accion={(
                    <Button to="/admin/productos/nuevo" icon={<Plus size={18} aria-hidden="true" />}>
                        Nuevo producto
                    </Button>
                )}
            >
                {cargando ? <Skeleton width="min(100%, 360px)" height="1.55em" /> : null}
                {!cargando && productos.status === "success" ? <p className={styles.resumen}>{resumenStock(productos.productos)}</p> : null}
            </EncabezadoPanel>

            {/* Los filtros se muestran también mientras carga, para que la tabla no salte. */}
            {cargando || (productos.status === "success" && productos.productos.length > 0) ? (
                <ProductoFiltros
                    variante="panel"
                    filtros={filtros}
                    onCambiar={cambiar}
                    onLimpiar={limpiar}
                    categorias={categorias.categorias}
                    resultados={visibles.length}
                    cargando={cargando}
                />
            ) : null}

            <div className={styles.contenido} aria-busy={cargando}>{contenido}</div>

            <ConfirmDialog
                open={aDarDeBaja !== null}
                titulo={aDarDeBaja ? `¿Dar de baja «${aDarDeBaja.nombre}»?` : ""}
                confirmLabel="Dar de baja"
                loadingLabel="Dando de baja…"
                loading={dandoDeBaja}
                error={errorBaja}
                onConfirm={confirmarBaja}
                onCancel={cancelarBaja}
                onClosed={alCerrarDialogo}
            >
                <p>Va a dejar de mostrarse en la tienda y en el catálogo. Esta acción no se puede deshacer desde el panel.</p>
            </ConfirmDialog>
        </>
    );
}
