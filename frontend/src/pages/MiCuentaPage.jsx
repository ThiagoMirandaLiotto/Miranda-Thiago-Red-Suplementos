import { useState } from "react";
import { useNavigate } from "react-router";
import { BadgeCheck, Ban, Clock, LogOut, UserRound } from "lucide-react";
import EncabezadoPublico from "../components/layout/EncabezadoPublico.jsx";
import DetalleProductos from "../components/pedidos/DetalleProductos.jsx";
import EstadoPedidoBadge from "../components/pedidos/EstadoPedidoBadge.jsx";
import PasosPedido from "../components/pedidos/PasosPedido.jsx";
import ResumenImportes from "../components/pedidos/ResumenImportes.jsx";
import Badge from "../components/ui/Badge.jsx";
import BotonMensajeInstagram from "../components/ui/BotonMensajeInstagram.jsx";
import Button from "../components/ui/Button.jsx";
import CheckboxField from "../components/ui/CheckboxField.jsx";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import TextField from "../components/ui/TextField.jsx";
import { useRecurso } from "../hooks/useRecurso.js";
import { useReveal } from "../hooks/useReveal.js";
import { useSesion } from "../hooks/useSesion.js";
import { updatePerfil } from "../services/authService.js";
import { cambiarEstadoPedido, getPedidos } from "../services/pedidosService.js";
import { NEGOCIO } from "../utils/constants.js";
import { describirRetiro, formatFechaHora } from "../utils/fechas.js";
import { formatPrecio } from "../utils/formatters.js";
import { mensajeRepetir } from "../utils/instagram.js";
import { mensajeDeError, notify } from "../utils/notify.js";
import { ESTADO, estaActivo, resumirProductos } from "../utils/pedidos.js";
import { limpiarTelefono, validarPerfil } from "../utils/validarCuenta.js";
import styles from "./MiCuentaPage.module.css";

const clave = (pedido) => `${pedido.fechaRetiro} ${pedido.horaRetiro}`;

// F-07: el pedido en curso, el historial y los datos personales del cliente.
// Los pedidos llegan por Instagram y los registra el local; acá se siguen y, mientras están pendientes, se cancelan (RN-04).
export default function MiCuentaPage() {
    const { usuario, salir } = useSesion();
    const navigate = useNavigate();
    const pedidos = useRecurso((signal) => getPedidos({ signal }), { idAviso: "carga-mis-pedidos" });
    const [aCancelar, setACancelar] = useState(null);
    const [cancelando, setCancelando] = useState(false);
    const [errorCancelar, setErrorCancelar] = useState(null);
    const revelar = useReveal();

    async function confirmarCancelacion() {
        setCancelando(true);
        setErrorCancelar(null);
        try {
            const actualizado = await cambiarEstadoPedido(aCancelar.idPedido, ESTADO.CANCELADO);
            pedidos.reemplazar((lista) => lista.map((pedido) => (pedido.idPedido === actualizado.idPedido ? actualizado : pedido)));
            setACancelar(null);
            notify.success(`Cancelaste el pedido ${actualizado.codigo}`, { description: "Queda en tu historial como cancelado." });
        } catch (error) {
            notify.error(error, { id: "cancelar-mi-pedido" });
            setErrorCancelar(mensajeDeError(error));
            // Si el local ya lo marcó listo, se cierra el diálogo y se actualiza el estado.
            if (error.status === 409 || error.status === 404) {
                setACancelar(null);
                pedidos.recargar();
            }
        } finally {
            setCancelando(false);
        }
    }

    async function cerrarSesion() {
        await salir();
        notify.success("Cerraste tu sesión");
        navigate("/", { replace: true });
    }

    const todos = pedidos.datos ?? [];
    const enCurso = todos.filter(estaActivo).sort((a, b) => clave(a).localeCompare(clave(b)));
    const anteriores = todos.filter((pedido) => !estaActivo(pedido));

    return (
        <>
            <title>Mi cuenta · RED Suplementos</title>
            <EncabezadoPublico
                lineas={["Mi cuenta"]}
                bajada={`Hola, ${usuario.nombre}. Pedís por Instagram y acá seguís cada pedido hasta que lo retirás.`}
            />

            <div ref={revelar} className={styles.cuerpo}>
                <div className={styles.principal} aria-busy={pedidos.status === "loading"}>
                    <section className={`${styles.seccion} reveal`} aria-labelledby="en-curso-titulo">
                        <h2 id="en-curso-titulo" className={styles.titulo}>Pedidos en curso</h2>
                        {!pedidos.datos && pedidos.status === "loading" ? <Skeleton height="280px" /> : null}
                        {!pedidos.datos && pedidos.status === "error" ? (
                            <ErrorState titulo="No pudimos cargar tus pedidos" error={pedidos.error} onRetry={pedidos.recargar} as="h3" />
                        ) : null}
                        {pedidos.datos && enCurso.length === 0 ? <SinPedidos usuario={usuario} /> : null}
                        {enCurso.map((pedido) => (
                            <PedidoEnCurso key={pedido.idPedido} pedido={pedido} onCancelar={() => { setErrorCancelar(null); setACancelar(pedido); }} />
                        ))}
                    </section>

                    {anteriores.length ? (
                        <section className={`${styles.seccion} reveal`} style={{ "--i": 2 }} aria-labelledby="historial-titulo">
                            <h2 id="historial-titulo" className={styles.titulo}>Historial</h2>
                            <ul className={styles.historial}>
                                {anteriores.map((pedido) => <PedidoAnterior key={pedido.idPedido} pedido={pedido} usuario={usuario} />)}
                            </ul>
                        </section>
                    ) : null}
                </div>

                <aside className={`${styles.lateral} reveal`} style={{ "--i": 1 }} aria-labelledby="datos-titulo">
                    <h2 id="datos-titulo" className={styles.titulo}>Tus datos</h2>
                    <Membresia usuario={usuario} />
                    <FormularioPerfil />
                    <Button variant="ghost" icon={<LogOut size={18} aria-hidden="true" />} onClick={cerrarSesion}>Cerrar sesión</Button>
                </aside>
            </div>

            <ConfirmDialog
                open={aCancelar !== null}
                titulo={aCancelar ? `¿Cancelar el pedido ${aCancelar.codigo}?` : ""}
                confirmLabel="Cancelar pedido"
                cancelLabel="Volver"
                loadingLabel="Cancelando…"
                loading={cancelando}
                error={errorCancelar}
                onConfirm={confirmarCancelacion}
                onCancel={() => setACancelar(null)}
            >
                <p>Lo liberamos para otra persona y queda en tu historial como cancelado. Si querés otro, escribinos por Instagram.</p>
            </ConfirmDialog>
        </>
    );
}

function SinPedidos({ usuario }) {
    return (
        <div className={styles.vacio}>
            <p className={styles.vacioTitulo}>No tenés pedidos en curso.</p>
            <p>Escribinos por Instagram con lo que querés y cuándo pasás: el local lo registra a tu nombre y lo vas a ver acá.</p>
            <div className={styles.acciones}>
                <BotonMensajeInstagram
                    mensaje={`Hola, ${NEGOCIO.nombre}. Quiero hacer un pedido para retirar en el local. Tengo cuenta en la página con ${usuario.email}.`}
                    etiqueta="Pedir por Instagram"
                />
                <Button to="/catalogo" variant="secondary">Ver el catálogo</Button>
            </div>
        </div>
    );
}

function PedidoEnCurso({ pedido, onCancelar }) {
    const listo = pedido.estado === ESTADO.LISTO_PARA_RETIRAR;
    return (
        <article className={styles.pedido} aria-labelledby={`pedido-${pedido.idPedido}`}>
            <div className={styles.pedidoArriba}>
                <h3 id={`pedido-${pedido.idPedido}`} className={styles.codigo}>Pedido {pedido.codigo}</h3>
                <EstadoPedidoBadge estado={pedido.estado} />
            </div>
            <PasosPedido estado={pedido.estado} />
            <p className={styles.retiro}>
                {listo ? "Ya está listo: pasá a retirarlo " : "El local lo está preparando. Lo retirás "}
                <strong>{describirRetiro(pedido).toLowerCase()}</strong> en {NEGOCIO.direccion}.
            </p>
            <DetalleProductos detalles={pedido.detalles} titulo={`Productos del pedido ${pedido.codigo}`} />
            <ResumenImportes {...pedido} />
            {pedido.estado === ESTADO.PENDIENTE ? (
                <div className={styles.acciones}>
                    <Button variant="dangerGhost" icon={<Ban size={18} aria-hidden="true" />} onClick={onCancelar}>
                        Cancelar pedido
                    </Button>
                </div>
            ) : (
                <p className={styles.nota}>Ya está separado en el mostrador. Si no podés pasar, avisanos por Instagram.</p>
            )}
        </article>
    );
}

function PedidoAnterior({ pedido, usuario }) {
    const fecha = pedido.estado === ESTADO.ENTREGADO ? pedido.fechaEntrega : pedido.fechaCierre;
    return (
        <li className={styles.anterior}>
            <div className={styles.pedidoArriba}>
                <span className={styles.codigo}>{pedido.codigo}</span>
                <EstadoPedidoBadge estado={pedido.estado} />
            </div>
            <p className={styles.resumen}>{resumirProductos(pedido.detalles)}</p>
            <p className={`${styles.nota} tabular`}>
                {fecha ? `${formatFechaHora(fecha)} · ` : ""}{formatPrecio(pedido.total)}
                {pedido.porcentajeDescuento ? ` (con ${pedido.porcentajeDescuento} % de socio)` : ""}
            </p>
            {pedido.motivoCancelacion ? <p className={styles.nota}>Motivo: {pedido.motivoCancelacion}</p> : null}
            <div>
                <BotonMensajeInstagram
                    mensaje={mensajeRepetir(pedido, usuario)}
                    variant="tonal"
                    etiqueta="Repetir por Instagram"
                    detalle={`pedido ${pedido.codigo}`}
                />
            </div>
        </li>
    );
}

function Membresia({ usuario }) {
    if (usuario.membresiaActiva) {
        return (
            <p className={styles.membresia}>
                <Badge tono="success" icon={<BadgeCheck size={16} aria-hidden="true" />}>Socio verificado</Badge>
                Tenés {NEGOCIO.descuentoSocios} % de descuento en tus pedidos.
            </p>
        );
    }
    if (usuario.esSocioGym) {
        return (
            <p className={styles.membresia}>
                <Badge tono="warning" icon={<Clock size={16} aria-hidden="true" />}>Membresía para verificar</Badge>
                Mostrala en el mostrador y el {NEGOCIO.descuentoSocios} % se aplica en tus próximos pedidos.
            </p>
        );
    }
    return (
        <p className={styles.membresia}>
            <Badge tono="neutral" icon={<UserRound size={16} aria-hidden="true" />}>Sin membresía de {NEGOCIO.gimnasio}</Badge>
            Si sos socio, marcalo abajo y lo verificamos.
        </p>
    );
}

// Los datos que puede cambiar el cliente. Si cambia lo que declara sobre la membresía, el local la vuelve a verificar.
function FormularioPerfil() {
    const { usuario, actualizarUsuario } = useSesion();
    const [valores, setValores] = useState({
        nombre: usuario.nombre, apellido: usuario.apellido, telefono: usuario.telefono, esSocioGym: usuario.esSocioGym
    });
    const [errores, setErrores] = useState({});
    const [guardando, setGuardando] = useState(false);

    function cambiar(event) {
        const { name, value, type, checked } = event.target;
        setValores((actuales) => ({ ...actuales, [name]: type === "checkbox" ? checked : value }));
        setErrores((anteriores) => ({ ...anteriores, [name]: undefined }));
    }

    async function guardar(event) {
        event.preventDefault();
        if (guardando) return;
        const formulario = event.currentTarget;
        const { errores: encontrados, valido } = validarPerfil(valores);
        setErrores(encontrados);
        if (!valido) {
            formulario.elements.namedItem(["nombre", "apellido", "telefono"].find((campo) => encontrados[campo]))?.focus();
            return;
        }
        setGuardando(true);
        try {
            const actualizado = await updatePerfil({
                nombre: valores.nombre.trim(),
                apellido: valores.apellido.trim(),
                telefono: limpiarTelefono(valores.telefono.trim()),
                esSocioGym: valores.esSocioGym
            });
            const cambioMembresia = actualizado.esSocioGym !== usuario.esSocioGym;
            actualizarUsuario(actualizado);
            notify.success("Guardaste tus datos", {
                description: cambioMembresia ? "Como cambió tu membresía, el local la vuelve a verificar." : undefined
            });
        } catch (error) {
            notify.error(error, { id: "perfil" });
        } finally {
            setGuardando(false);
        }
    }

    const campo = (nombre) => ({ name: nombre, value: valores[nombre], onChange: cambiar, error: errores[nombre], required: true });

    return (
        <form className={styles.perfil} onSubmit={guardar} noValidate aria-label="Tus datos personales">
            <p className={styles.email}>
                <span>Email</span>
                <strong>{usuario.email}</strong>
            </p>
            <TextField label="Nombre" autoComplete="given-name" maxLength={80} {...campo("nombre")} />
            <TextField label="Apellido" autoComplete="family-name" maxLength={80} {...campo("apellido")} />
            <TextField label="Teléfono" type="tel" inputMode="numeric" autoComplete="tel" {...campo("telefono")} />
            <CheckboxField name="esSocioGym" label={`Soy socio de ${NEGOCIO.gimnasio}`} checked={valores.esSocioGym} onChange={cambiar} />
            <Button type="submit" variant="secondary" loading={guardando} loadingText="Guardando…">Guardar cambios</Button>
        </form>
    );
}
