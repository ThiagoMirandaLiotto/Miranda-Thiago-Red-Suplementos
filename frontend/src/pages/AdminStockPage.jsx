import { useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowDownLeft, ArrowUpRight, PackagePlus, SearchX } from "lucide-react";
import EncabezadoPanel from "../components/layout/EncabezadoPanel.jsx";
import StockBadge from "../components/productos/StockBadge.jsx";
import Button from "../components/ui/Button.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import Segmentos from "../components/ui/Segmentos.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import TextField from "../components/ui/TextField.jsx";
import { useRecurso } from "../hooks/useRecurso.js";
import { getProductoById } from "../services/productosService.js";
import { getMovimientos, registrarMovimiento } from "../services/stockService.js";
import { formatFechaHora } from "../utils/fechas.js";
import { formatCantidad } from "../utils/formatters.js";
import { notify } from "../utils/notify.js";
import styles from "./AdminStockPage.module.css";

const TIPOS = [
    { valor: "INGRESO", etiqueta: "Ingreso de mercadería" },
    { valor: "AJUSTE", etiqueta: "Ajuste de inventario" }
];
const SENTIDOS = [
    { valor: "restar", etiqueta: "Descontar" },
    { valor: "sumar", etiqueta: "Sumar" }
];
const NOMBRE_TIPO = { INGRESO: "Ingreso", VENTA: "Venta", AJUSTE: "Ajuste", DEVOLUCION: "Devolución" };
const FORMULARIO_VACIO = { tipo: "INGRESO", sentido: "restar", cantidad: "", observacion: "" };

// Mismas reglas que la API (validateMovimiento.js).
function validar({ tipo, cantidad, observacion }) {
    const errores = {};
    const limpia = cantidad.trim();
    if (!/^\d+$/.test(limpia) || Number(limpia) < 1) errores.cantidad = "Ingresá una cantidad entera mayor que 0.";
    else if (Number(limpia) > 100000) errores.cantidad = "La cantidad puede ser de hasta 100.000 unidades.";
    const motivo = observacion.trim();
    if (tipo === "AJUSTE" && motivo.length < 3) errores.observacion = "Contá por qué ajustás el stock, por ejemplo «Envase roto».";
    if (motivo.length > 200) errores.observacion = "Puede tener hasta 200 caracteres.";
    return errores;
}

export default function AdminStockPage() {
    const { id } = useParams();
    return <StockProducto key={id} id={id} />;
}

function StockProducto({ id }) {
    const producto = useRecurso((signal) => getProductoById(id, signal), { idAviso: `carga-producto-${id}` });
    const movimientos = useRecurso((signal) => getMovimientos(id, signal), { idAviso: `carga-movimientos-${id}` });
    const [form, setForm] = useState(FORMULARIO_VACIO);
    const [errores, setErrores] = useState({});
    const [guardando, setGuardando] = useState(false);

    function cambiar(campo, valor) {
        setForm((actual) => ({ ...actual, [campo]: valor }));
        setErrores((anteriores) => ({ ...anteriores, [campo]: undefined }));
    }

    async function registrar(event) {
        event.preventDefault();
        if (guardando) return;
        const formulario = event.currentTarget;
        const encontrados = validar(form);
        setErrores(encontrados);
        if (Object.keys(encontrados).length) {
            formulario.elements.namedItem(encontrados.cantidad ? "cantidad" : "observacion")?.focus();
            return;
        }
        const signo = form.tipo === "AJUSTE" && form.sentido === "restar" ? -1 : 1;
        const movimiento = { tipo: form.tipo, cantidad: signo * Number(form.cantidad.trim()) };
        if (form.observacion.trim()) movimiento.observacion = form.observacion.trim();
        setGuardando(true);
        try {
            const resultado = await registrarMovimiento(id, movimiento);
            producto.reemplazar(resultado.producto);
            movimientos.reemplazar((lista) => [resultado.movimiento, ...(lista ?? [])]);
            setForm(FORMULARIO_VACIO);
            const unidades = formatCantidad(Math.abs(resultado.movimiento.cantidad), "unidad", "unidades");
            notify.success(
                form.tipo === "INGRESO" ? `Registraste el ingreso de ${unidades}` : `Registraste el ajuste: ${signo < 0 ? "−" : "+"}${unidades}`,
                { description: `Stock actual: ${resultado.producto.stock}.` }
            );
            if (resultado.alertaStock) {
                notify.info("Sigue por debajo del mínimo", {
                    description: `Tiene ${resultado.producto.stock} y el mínimo es ${resultado.producto.stockMinimo}.`
                });
            }
        } catch (error) {
            notify.error(error, { id: "movimiento-stock" });
            if (error.status === 409) setErrores({ cantidad: error.message });
            if (error.status === 404) producto.recargar();
        } finally {
            setGuardando(false);
        }
    }

    const datos = producto.datos;
    if (producto.status === "error" && !datos) {
        return (
            <>
                <title>Stock · Panel · RED Suplementos</title>
                <EncabezadoPanel titulo="Stock" volver />
                {producto.error?.status === 404 ? (
                    <EmptyState
                        icon={<SearchX size={28} />}
                        titulo="No encontramos este producto"
                        accion={<Button to="/admin/productos" variant="secondary">Volver a productos</Button>}
                    >
                        <p>Puede que se haya dado de baja o que el enlace esté mal escrito.</p>
                    </EmptyState>
                ) : (
                    <ErrorState as="h2" titulo="No pudimos cargar el producto" error={producto.error} onRetry={producto.recargar} />
                )}
            </>
        );
    }

    return (
        <>
            <title>{`Stock${datos ? ` de ${datos.nombre}` : ""} · Panel · RED Suplementos`}</title>
            <EncabezadoPanel
                titulo={datos ? `Stock de «${datos.nombre}»` : "Stock"}
                volver
                estado={datos ? <StockBadge producto={datos} contexto="panel" /> : null}
            >
                {datos ? (
                    <p className={styles.resumen}>
                        <strong className="tabular">{formatCantidad(datos.stock, "unidad", "unidades")}</strong> en el local · mínimo{" "}
                        <span className="tabular">{datos.stockMinimo}</span>. Las ventas y las devoluciones las registran los pedidos.
                    </p>
                ) : (
                    <Skeleton width="min(100%, 420px)" height="1.55em" />
                )}
            </EncabezadoPanel>

            <div className={styles.grilla}>
                <form className={styles.formulario} onSubmit={registrar} noValidate aria-labelledby="registrar-titulo">
                    <h2 id="registrar-titulo" className={styles.subtitulo}>Registrar un movimiento</h2>
                    <Segmentos leyenda="Tipo de movimiento" opciones={TIPOS} valor={form.tipo} onCambiar={(valor) => cambiar("tipo", valor)} ancho />
                    {form.tipo === "AJUSTE" ? (
                        <Segmentos leyenda="El ajuste" opciones={SENTIDOS} valor={form.sentido} onCambiar={(valor) => cambiar("sentido", valor)} ancho />
                    ) : null}
                    <TextField
                        label={form.tipo === "INGRESO" ? "Unidades que entraron" : "Unidades"}
                        required
                        name="cantidad"
                        inputMode="numeric"
                        value={form.cantidad}
                        onChange={(event) => cambiar("cantidad", event.target.value)}
                        error={errores.cantidad}
                        autoComplete="off"
                    />
                    <TextField
                        label={form.tipo === "INGRESO" ? "Observación" : "Motivo"}
                        required={form.tipo === "AJUSTE"}
                        name="observacion"
                        value={form.observacion}
                        onChange={(event) => cambiar("observacion", event.target.value)}
                        error={errores.observacion}
                        maxLength={220}
                        autoComplete="off"
                        hint={form.tipo === "INGRESO" ? "Opcional: proveedor, remito o lote." : "Queda en el historial, por ejemplo «Envase roto» o «Conteo de fin de mes»."}
                    />
                    <Button type="submit" icon={<PackagePlus size={18} aria-hidden="true" />} loading={guardando} loadingText="Registrando…" disabled={!datos}>
                        {form.tipo === "INGRESO" ? "Registrar ingreso" : "Registrar ajuste"}
                    </Button>
                </form>

                <section className={styles.historial} aria-labelledby="historial-titulo" aria-busy={movimientos.status === "loading"}>
                    <h2 id="historial-titulo" className={styles.subtitulo}>Movimientos</h2>
                    <Movimientos estado={movimientos} />
                </section>
            </div>
        </>
    );
}

function Movimientos({ estado }) {
    if (!estado.datos && estado.status === "loading") {
        return (
            <div role="status" className={styles.esqueleto}>
                <span className="visually-hidden">Cargando movimientos…</span>
                {[0, 1, 2].map((numero) => <Skeleton key={numero} height="44px" />)}
            </div>
        );
    }
    if (!estado.datos) return <ErrorState as="h3" titulo="No pudimos cargar los movimientos" error={estado.error} onRetry={estado.recargar} />;
    if (estado.datos.length === 0) return <p className={styles.vacio}>Todavía no hay movimientos de este producto.</p>;
    return (
        <ol className={styles.lista}>
            {estado.datos.map((movimiento) => {
                const entra = movimiento.cantidad > 0;
                const Icono = entra ? ArrowDownLeft : ArrowUpRight;
                return (
                    <li key={movimiento.idMovimiento} className={styles.movimiento}>
                        <span className={styles.tipo} data-sentido={entra ? "entra" : "sale"}>
                            <Icono size={16} aria-hidden="true" />
                            {NOMBRE_TIPO[movimiento.tipo]}
                        </span>
                        <span className={`${styles.cantidad} tabular`}>
                            {entra ? "+" : "−"}{Math.abs(movimiento.cantidad)}
                            <span className={styles.resultante}> → {movimiento.stockResultante}</span>
                        </span>
                        <span className={styles.detalle}>
                            {movimiento.idPedido
                                ? <Link to={`/admin/pedidos/${movimiento.idPedido}`}>{movimiento.observacion}</Link>
                                : movimiento.observacion}
                        </span>
                        <span className={`${styles.meta} tabular`}>
                            {formatFechaHora(movimiento.fecha)} · {movimiento.nombreUsuario}
                        </span>
                    </li>
                );
            })}
        </ol>
    );
}
