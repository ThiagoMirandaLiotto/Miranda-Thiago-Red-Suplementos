import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowUpRight, Ban, CircleCheck, PackageCheck, Repeat, SearchX } from "lucide-react";
import EncabezadoPanel from "../components/layout/EncabezadoPanel.jsx";
import DetalleProductos from "../components/pedidos/DetalleProductos.jsx";
import EstadoPedidoBadge from "../components/pedidos/EstadoPedidoBadge.jsx";
import HistorialPedido from "../components/pedidos/HistorialPedido.jsx";
import ResumenImportes from "../components/pedidos/ResumenImportes.jsx";
import Button from "../components/ui/Button.jsx";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import TextAreaField from "../components/ui/TextAreaField.jsx";
import { useRecurso } from "../hooks/useRecurso.js";
import { cambiarEstadoPedido, getPedido, repetirPedido } from "../services/pedidosService.js";
import { describirDia, describirRetiro, formatFechaHora, sumarDias } from "../utils/fechas.js";
import { urlPerfil } from "../utils/instagram.js";
import { mensajeDeError, notify } from "../utils/notify.js";
import { ESTADO, ETIQUETA_ESTADO, estaActivo, siguientePaso } from "../utils/pedidos.js";
import styles from "./AdminPedidoPage.module.css";

const VOLVER = { destino: "/admin/pedidos", texto: "Pedidos" };
const MOTIVO_MINIMO = 5;

export default function AdminPedidoPage() {
    const { id } = useParams();
    // Con otro id se monta una pantalla nueva, sin datos del pedido anterior.
    return <DetallePedido key={id} id={id} />;
}

function DetallePedido({ id }) {
    const pedido = useRecurso((signal) => getPedido(id, signal), { idAviso: `carga-pedido-${id}` });
    const navigate = useNavigate();
    const [guardando, setGuardando] = useState(null);
    const [cancelacion, setCancelacion] = useState({ abierta: false, motivo: "", error: null });

    const datos = pedido.datos;
    const paso = datos ? siguientePaso(datos) : null;

    async function avanzar() {
        setGuardando("avanzar");
        try {
            const actualizado = await cambiarEstadoPedido(id, paso.estado);
            pedido.reemplazar(actualizado);
            notify.success(`${actualizado.codigo}: ${ETIQUETA_ESTADO[actualizado.estado].toLowerCase()}`, {
                description: actualizado.estado === ESTADO.ENTREGADO ? "La venta ya cuenta en los reportes." : "El cliente lo ve en su cuenta."
            });
        } catch (error) {
            notify.error(error, { id: "estado-pedido" });
            if (error.status === 409) pedido.recargar();
        } finally {
            setGuardando(null);
        }
    }

    async function confirmarCancelacion() {
        const motivo = cancelacion.motivo.trim();
        if (motivo.length < MOTIVO_MINIMO) {
            setCancelacion((actual) => ({ ...actual, error: "Escribí el motivo, con al menos 5 caracteres. Queda en el historial del pedido." }));
            return;
        }
        setGuardando("cancelar");
        try {
            const actualizado = await cambiarEstadoPedido(id, ESTADO.CANCELADO, motivo);
            pedido.reemplazar(actualizado);
            setCancelacion({ abierta: false, motivo: "", error: null });
            notify.success(`Cancelaste ${actualizado.codigo}`, { description: "El stock reservado volvió al inventario." });
        } catch (error) {
            notify.error(error, { id: "cancelar-pedido" });
            setCancelacion((actual) => ({ ...actual, error: mensajeDeError(error) }));
            if (error.status === 409) pedido.recargar();
        } finally {
            setGuardando(null);
        }
    }

    async function repetir() {
        setGuardando("repetir");
        try {
            const { avisos, idCliente, cliente } = await repetirPedido(id);
            notify.success("Cargamos los productos en el carrito", { description: "Revisá las cantidades y el retiro antes de confirmar." });
            avisos.forEach((aviso) => notify.info(aviso, { duration: 10000 }));
            navigate("/admin/pedidos/nuevo", { state: { idCliente, cliente } });
        } catch (error) {
            notify.error(error, { id: "repetir-pedido" });
            setGuardando(null);
        }
    }

    if (pedido.status === "error" && !datos) {
        return (
            <>
                <title>Pedido · Panel · RED Suplementos</title>
                <EncabezadoPanel titulo="Pedido" volver={VOLVER} />
                {pedido.error?.status === 404 ? (
                    <EmptyState
                        icon={<SearchX size={28} />}
                        titulo="No encontramos este pedido"
                        accion={<Button to="/admin/pedidos" variant="secondary">Ver todos los pedidos</Button>}
                    >
                        <p>Revisá el enlace o buscalo por su código en la lista.</p>
                    </EmptyState>
                ) : (
                    <ErrorState as="h2" titulo="No pudimos cargar el pedido" error={pedido.error} onRetry={pedido.recargar} />
                )}
            </>
        );
    }

    if (!datos) {
        return (
            <div aria-busy="true">
                <title>Pedido · Panel · RED Suplementos</title>
                <EncabezadoPanel titulo="Pedido" volver={VOLVER}>
                    <Skeleton width="min(100%, 320px)" height="1.55em" />
                </EncabezadoPanel>
                <div className={styles.esqueleto} role="status">
                    <span className="visually-hidden">Cargando el pedido…</span>
                    <Skeleton height="240px" />
                    <Skeleton height="240px" />
                </div>
            </div>
        );
    }

    const IconoPaso = paso?.estado === ESTADO.ENTREGADO ? CircleCheck : PackageCheck;
    const hora = Number(datos.horaRetiro.slice(0, 2));

    return (
        <>
            <title>{`${datos.codigo} · Pedidos · Panel · RED Suplementos`}</title>
            <EncabezadoPanel
                titulo={`Pedido ${datos.codigo}`}
                volver={VOLVER}
                estado={<EstadoPedidoBadge estado={datos.estado} />}
                accion={paso ? (
                    <Button
                        onClick={avanzar}
                        loading={guardando === "avanzar"}
                        loadingText="Guardando…"
                        disabled={guardando !== null && guardando !== "avanzar"}
                        icon={<IconoPaso size={18} aria-hidden="true" />}
                    >
                        {paso.etiqueta}
                    </Button>
                ) : null}
            >
                <p className={styles.bajada}>
                    Registrado el {formatFechaHora(datos.fechaCreacion)} por {datos.historial[0]?.nombreUsuario ?? "el local"}.
                </p>
            </EncabezadoPanel>

            <div className={styles.grilla}>
                <section className={styles.bloque} aria-labelledby="productos-titulo">
                    <h2 id="productos-titulo" className={styles.subtitulo}>Productos</h2>
                    <DetalleProductos detalles={datos.detalles} />
                    <ResumenImportes {...datos} className={styles.importes} />
                </section>

                <aside className={styles.lateral} aria-label="Retiro, cliente y acciones">
                    <section className={styles.bloque} aria-labelledby="retiro-titulo">
                        <h2 id="retiro-titulo" className={styles.subtitulo}>Retiro en el local</h2>
                        <p className={styles.destacado}>{describirRetiro(datos)}</p>
                        {estaActivo(datos) ? (
                            <p className={styles.nota}>
                                Si no lo retira, vence {describirDia(sumarDias(datos.fechaRetiro, 2)).toLowerCase()} a las {hora + 1} h
                                y el stock vuelve solo.
                            </p>
                        ) : null}
                        {datos.estado === ESTADO.ENTREGADO ? <p className={styles.nota}>Entregado el {formatFechaHora(datos.fechaEntrega)}.</p> : null}
                        {datos.motivoCancelacion ? (
                            <p className={styles.motivo}>
                                <strong>{datos.estado === ESTADO.VENCIDO ? "Venció" : "Se canceló"} el {formatFechaHora(datos.fechaCierre)}:</strong>{" "}
                                {datos.motivoCancelacion}
                            </p>
                        ) : null}
                    </section>

                    <section className={styles.bloque} aria-labelledby="cliente-titulo">
                        <h2 id="cliente-titulo" className={styles.subtitulo}>Cliente</h2>
                        <p className={styles.destacado}>{datos.cliente.nombre}</p>
                        <Contacto pedido={datos} />
                        <p className={styles.nota}>
                            {datos.idCliente ? "Tiene cuenta: sigue este pedido desde «Mi cuenta»." : "Sin cuenta: lo pidió por Instagram."}
                            {datos.porcentajeDescuento > 0 ? ` Socio de RED GYM verificado: ${datos.porcentajeDescuento} % aplicado.` : ""}
                        </p>
                    </section>

                    <section className={styles.bloque} aria-labelledby="acciones-titulo">
                        <h2 id="acciones-titulo" className={styles.subtitulo}>Otras acciones</h2>
                        <div className={styles.acciones}>
                            <Button
                                variant="tonal"
                                icon={<Repeat size={18} aria-hidden="true" />}
                                onClick={repetir}
                                loading={guardando === "repetir"}
                                loadingText="Cargando…"
                                disabled={guardando !== null && guardando !== "repetir"}
                            >
                                Repetir pedido
                            </Button>
                            {estaActivo(datos) ? (
                                <Button
                                    variant="dangerGhost"
                                    icon={<Ban size={18} aria-hidden="true" />}
                                    onClick={() => setCancelacion({ abierta: true, motivo: "", error: null })}
                                    disabled={guardando !== null}
                                >
                                    Cancelar pedido
                                </Button>
                            ) : null}
                        </div>
                    </section>
                </aside>

                <section className={`${styles.bloque} ${styles.historial}`} aria-labelledby="historial-titulo">
                    <h2 id="historial-titulo" className={styles.subtitulo}>Historial</h2>
                    <HistorialPedido historial={datos.historial} />
                </section>
            </div>

            <ConfirmDialog
                open={cancelacion.abierta}
                titulo={`¿Cancelar ${datos.codigo}?`}
                confirmLabel="Cancelar pedido"
                cancelLabel="Volver"
                loadingLabel="Cancelando…"
                loading={guardando === "cancelar"}
                error={cancelacion.error}
                onConfirm={confirmarCancelacion}
                onCancel={() => setCancelacion({ abierta: false, motivo: "", error: null })}
                campos={(
                    <TextAreaField
                        label="Motivo"
                        required
                        rows={3}
                        maxLength={300}
                        value={cancelacion.motivo}
                        onChange={(event) => setCancelacion((actual) => ({ ...actual, motivo: event.target.value, error: null }))}
                        hint="Por ejemplo: «Avisó que no puede pasar» o «Faltó stock del proveedor»."
                    />
                )}
            >
                <p>El stock reservado vuelve al inventario y el cliente ve el motivo en su cuenta.</p>
            </ConfirmDialog>
        </>
    );
}

function Contacto({ pedido }) {
    const { contacto, telefono } = pedido.cliente;
    if (contacto.startsWith("@")) {
        return (
            <a className={styles.enlace} href={urlPerfil(contacto.slice(1))} target="_blank" rel="noopener noreferrer">
                {contacto} en Instagram
                <ArrowUpRight size={16} aria-hidden="true" />
                <span className="visually-hidden"> (se abre en una pestaña nueva)</span>
            </a>
        );
    }
    if (/^\d+$/.test(contacto)) return <a className={styles.enlace} href={`tel:${contacto}`}>{contacto}</a>;
    return (
        <p className={styles.contacto}>
            <a className={styles.enlace} href={`mailto:${contacto}`}>{contacto}</a>
            {telefono ? <> · <a className={styles.enlace} href={`tel:${telefono}`}>{telefono}</a></> : null}
        </p>
    );
}
