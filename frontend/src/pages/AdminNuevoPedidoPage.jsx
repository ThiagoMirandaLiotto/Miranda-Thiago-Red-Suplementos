import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { CircleAlert, ClipboardCheck } from "lucide-react";
import EncabezadoPanel from "../components/layout/EncabezadoPanel.jsx";
import CarritoPedido from "../components/pedidos/CarritoPedido.jsx";
import SelectorProductos from "../components/pedidos/SelectorProductos.jsx";
import Button from "../components/ui/Button.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import Segmentos from "../components/ui/Segmentos.jsx";
import SelectField from "../components/ui/SelectField.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import TextField from "../components/ui/TextField.jsx";
import { useCategorias } from "../hooks/useCategorias.js";
import { useProductos } from "../hooks/useProductos.js";
import { useRecurso } from "../hooks/useRecurso.js";
import { agregarAlCarrito, cambiarCantidad, getCarrito, quitarDelCarrito, vaciarCarrito } from "../services/carritoService.js";
import { getClientes } from "../services/clientesService.js";
import { crearPedido } from "../services/pedidosService.js";
import { NEGOCIO } from "../utils/constants.js";
import { hoyEnElLocal, sumarDias } from "../utils/fechas.js";
import { formatCantidad } from "../utils/formatters.js";
import { mensajeDeError, notify } from "../utils/notify.js";
import { franjasDisponibles } from "../utils/pedidos.js";
import styles from "./AdminNuevoPedidoPage.module.css";

const VOLVER = { destino: "/admin/pedidos", texto: "Pedidos" };
const CONTACTO = /^(\d{8,15}|@?[A-Za-z0-9._]{1,30})$/;
const TIPOS_CLIENTE = [
    { valor: "cuenta", etiqueta: "Cliente con cuenta" },
    { valor: "invitado", etiqueta: "Sin cuenta" }
];

// Hoy, si todavía queda alguna franja; si no, mañana. La franja se elige a mano: es la que se acordó por Instagram.
function fechaInicial() {
    const hoy = hoyEnElLocal();
    return franjasDisponibles(hoy).length ? hoy : sumarDias(hoy, 1);
}

function validar({ carrito, tipoCliente, idCliente, invitado, fecha, hora }) {
    const errores = {};
    if (!carrito?.items.length) errores.carrito = "Agregá al menos un producto al carrito.";
    if (tipoCliente === "cuenta" && !idCliente) errores.idCliente = "Elegí el cliente.";
    if (tipoCliente === "invitado") {
        const nombre = invitado.nombre.trim();
        if (!nombre) errores.nombre = "Escribí el nombre de quien retira.";
        else if (nombre.length > 80) errores.nombre = "El nombre puede tener hasta 80 caracteres.";
        if (!CONTACTO.test(invitado.contacto.trim().replace(/[\s-]/g, ""))) {
            errores.contacto = "Escribí su usuario de Instagram (@usuario) o un teléfono de 8 a 15 números.";
        }
    }
    const hoy = hoyEnElLocal();
    if (!fecha) errores.fecha = "Elegí el día de retiro.";
    else if (fecha < hoy) errores.fecha = "El retiro no puede ser en una fecha pasada.";
    else if (fecha > sumarDias(hoy, NEGOCIO.diasMaximosAnticipacion)) errores.fecha = "Se puede programar hasta 30 días después de hoy.";
    if (!errores.fecha && !franjasDisponibles(fecha).some((franja) => franja.valor === hora)) {
        errores.hora = "Elegí una franja horaria disponible.";
    }
    return errores;
}

export default function AdminNuevoPedidoPage() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const productos = useProductos();
    const categorias = useCategorias();
    const clientes = useRecurso((signal) => getClientes({ signal }), { idAviso: "carga-clientes" });

    // "Repetir pedido" llega con el cliente del pedido original.
    const [tipoCliente, setTipoCliente] = useState(state?.cliente && !state?.idCliente ? "invitado" : "cuenta");
    const [idCliente, setIdCliente] = useState(state?.idCliente ? String(state.idCliente) : "");
    const [invitado, setInvitado] = useState({
        nombre: state?.idCliente ? "" : state?.cliente?.nombre ?? "",
        contacto: state?.idCliente ? "" : state?.cliente?.contacto ?? ""
    });
    const [fecha, setFecha] = useState(fechaInicial);
    const [hora, setHora] = useState("");
    const [errores, setErrores] = useState({});
    const [errorEnvio, setErrorEnvio] = useState(null);
    const [ocupado, setOcupado] = useState(null);
    const formRef = useRef(null);

    const clienteElegido = tipoCliente === "cuenta" && idCliente ? idCliente : "";
    const carrito = useRecurso((signal) => getCarrito({ idCliente: clienteElegido, signal }), {
        clave: clienteElegido,
        idAviso: "carga-carrito"
    });

    // Cada cambio vuelve con el carrito actualizado. Con un cliente elegido se pide de nuevo
    // para que la API sume su descuento de socio al total.
    async function cambiarCarrito(accion, idOcupado) {
        setOcupado(idOcupado);
        setErrorEnvio(null);
        try {
            const actualizado = await accion();
            if (clienteElegido) carrito.recargar();
            else carrito.reemplazar(actualizado);
            setErrores((anteriores) => ({ ...anteriores, carrito: undefined }));
            return true;
        } catch (error) {
            notify.error(error, { id: "carrito" });
            if (error.status === 409 || error.status === 404) carrito.recargar();
            return false;
        } finally {
            setOcupado(null);
        }
    }

    function cambiarFecha(nueva) {
        setFecha(nueva);
        if (!franjasDisponibles(nueva).some((franja) => franja.valor === hora)) setHora("");
        setErrores((anteriores) => ({ ...anteriores, fecha: undefined, hora: undefined }));
    }

    async function confirmar(event) {
        event.preventDefault();
        if (ocupado) return;
        const encontrados = validar({ carrito: carrito.datos, tipoCliente, idCliente, invitado, fecha, hora });
        setErrores(encontrados);
        setErrorEnvio(null);
        const campos = Object.keys(encontrados);
        if (campos.length) {
            notify.error(campos.length === 1 ? "Revisá el dato marcado." : `Revisá los ${campos.length} datos marcados.`, { id: "validacion-pedido" });
            if (encontrados.carrito) document.getElementById("carrito")?.focus();
            else formRef.current?.elements.namedItem(campos.find((campo) => campo !== "carrito"))?.focus();
            return;
        }

        const cliente = tipoCliente === "cuenta"
            ? { idCliente: Number(idCliente) }
            : { cliente: { nombre: invitado.nombre.trim(), contacto: invitado.contacto.trim().replace(/[\s-]/g, "") } };
        setOcupado("confirmar");
        try {
            const { pedido, alertasStock } = await crearPedido({ ...cliente, fechaRetiro: fecha, horaRetiro: hora });
            notify.success(`Registraste el pedido ${pedido.codigo}`, { description: "El stock quedó reservado hasta que lo retire." });
            for (const alerta of alertasStock) {
                notify.info(`Quedó poco stock de «${alerta.nombre}»`, {
                    description: `${formatCantidad(alerta.stock, "unidad", "unidades")} (mínimo ${alerta.stockMinimo}). Cargá un ingreso desde Productos.`,
                    duration: 12000
                });
            }
            navigate(`/admin/pedidos/${pedido.idPedido}`);
        } catch (error) {
            setErrorEnvio(mensajeDeError(error));
            notify.error(error, { id: "confirmar-pedido" });
            if (error.status === 409 || error.status === 404) carrito.recargar();
            setOcupado(null);
        }
    }

    const cargandoCatalogo = productos.status === "loading" || categorias.status === "loading";
    const enCarrito = new Map((carrito.datos?.items ?? []).map((item) => [item.idProducto, item.cantidad]));
    const opcionesClientes = (clientes.datos ?? []).map((cliente) => ({
        valor: String(cliente.idUsuario),
        etiqueta: `${cliente.apellido}, ${cliente.nombre} · ${cliente.email}${cliente.membresiaActiva ? " · socio, 10 %" : ""}`
    }));
    const hoy = hoyEnElLocal();

    let selector;
    if (cargandoCatalogo) {
        selector = <Skeleton height="420px" />;
    } else if (productos.status === "error" || categorias.status === "error") {
        selector = (
            <ErrorState
                as="h2"
                titulo="No pudimos cargar el catálogo"
                error={productos.error ?? categorias.error}
                onRetry={() => {
                    if (productos.status === "error") productos.recargar();
                    if (categorias.status === "error") categorias.recargar();
                }}
            />
        );
    } else {
        selector = (
            <SelectorProductos
                productos={productos.productos}
                mapaCategorias={categorias.mapaCategorias}
                enCarrito={enCarrito}
                ocupado={ocupado}
                onAgregar={(producto) => cambiarCarrito(() => agregarAlCarrito(producto.idProducto, 1), producto.idProducto)}
            />
        );
    }

    return (
        <>
            <title>Nuevo pedido · Panel · RED Suplementos</title>
            <EncabezadoPanel titulo="Nuevo pedido" volver={VOLVER}>
                <p className={styles.bajada}>
                    Cargá lo que te pidieron por Instagram. Al confirmar, el stock se descuenta y queda reservado hasta el retiro.
                </p>
                <a href="#datos-pedido" className={styles.saltar}>
                    Ir al carrito{carrito.datos?.items.length ? ` (${formatCantidad(carrito.datos.unidades, "unidad", "unidades")})` : ""}
                </a>
            </EncabezadoPanel>

            <div className={styles.grilla}>
                <div aria-busy={cargandoCatalogo}>{selector}</div>

                <form
                    id="datos-pedido"
                    ref={formRef}
                    className={styles.formulario}
                    onSubmit={confirmar}
                    noValidate
                    aria-busy={carrito.status === "loading"}
                >
                    {carrito.datos ? (
                        <CarritoPedido
                            carrito={carrito.datos}
                            ocupado={ocupado}
                            onCambiarCantidad={(item, cantidad) => cambiarCarrito(() => cambiarCantidad(item.idProducto, cantidad), item.idProducto)}
                            onQuitar={(item) => cambiarCarrito(() => quitarDelCarrito(item.idProducto), item.idProducto)}
                            onVaciar={() => cambiarCarrito(() => vaciarCarrito(), "vaciar")}
                        />
                    ) : carrito.status === "error" ? (
                        <ErrorState as="h2" titulo="No pudimos cargar el carrito" error={carrito.error} onRetry={carrito.recargar} />
                    ) : (
                        <Skeleton height="160px" />
                    )}
                    {errores.carrito ? (
                        <p className={styles.error}><CircleAlert size={16} aria-hidden="true" />{errores.carrito}</p>
                    ) : null}

                    <fieldset className={styles.grupo}>
                        <legend className={styles.leyenda}>¿Quién lo retira?</legend>
                        <Segmentos
                            leyenda="Tipo de cliente"
                            ocultarLeyenda
                            ancho
                            opciones={TIPOS_CLIENTE}
                            valor={tipoCliente}
                            onCambiar={(valor) => {
                                setTipoCliente(valor);
                                setErrores((anteriores) => ({ ...anteriores, idCliente: undefined, nombre: undefined, contacto: undefined }));
                            }}
                        />
                        {tipoCliente === "cuenta" ? (
                            <SelectField
                                label="Cliente"
                                required
                                name="idCliente"
                                value={idCliente}
                                onChange={(event) => {
                                    setIdCliente(event.target.value);
                                    setErrores((anteriores) => ({ ...anteriores, idCliente: undefined }));
                                }}
                                placeholder={clientes.status === "loading" ? "Cargando clientes…" : "Elegí un cliente"}
                                options={opcionesClientes}
                                error={errores.idCliente}
                                hint="Si es socio de RED GYM con la membresía verificada, la API le aplica el 10 %."
                            />
                        ) : (
                            <>
                                <TextField
                                    label="Nombre"
                                    required
                                    name="nombre"
                                    value={invitado.nombre}
                                    onChange={(event) => setInvitado((actual) => ({ ...actual, nombre: event.target.value }))}
                                    error={errores.nombre}
                                    autoComplete="off"
                                    maxLength={100}
                                />
                                <TextField
                                    label="Instagram o teléfono"
                                    required
                                    name="contacto"
                                    value={invitado.contacto}
                                    onChange={(event) => setInvitado((actual) => ({ ...actual, contacto: event.target.value }))}
                                    error={errores.contacto}
                                    autoComplete="off"
                                    hint="El usuario que te escribió (@usuario) o un teléfono, para avisarle."
                                />
                            </>
                        )}
                    </fieldset>

                    <fieldset className={styles.grupo}>
                        <legend className={styles.leyenda}>Retiro en el local</legend>
                        <div className={styles.dupla}>
                            <TextField
                                label="Día"
                                required
                                type="date"
                                name="fecha"
                                value={fecha}
                                min={hoy}
                                max={sumarDias(hoy, NEGOCIO.diasMaximosAnticipacion)}
                                onChange={(event) => cambiarFecha(event.target.value)}
                                error={errores.fecha}
                            />
                            <SelectField
                                label="Franja"
                                required
                                name="hora"
                                value={hora}
                                onChange={(event) => {
                                    setHora(event.target.value);
                                    setErrores((anteriores) => ({ ...anteriores, hora: undefined }));
                                }}
                                placeholder="Elegí una franja"
                                options={franjasDisponibles(fecha).map((franja) => ({ valor: franja.valor, etiqueta: franja.etiqueta }))}
                                error={errores.hora}
                            />
                        </div>
                        <p className={styles.nota}>{NEGOCIO.horario.texto}. Si no lo retira, a las 48 h vence y el stock vuelve solo.</p>
                    </fieldset>

                    {errorEnvio ? <p className={styles.error} role="alert"><CircleAlert size={16} aria-hidden="true" />{errorEnvio}</p> : null}
                    <Button
                        type="submit"
                        size="lg"
                        fullWidth
                        icon={<ClipboardCheck size={18} aria-hidden="true" />}
                        loading={ocupado === "confirmar"}
                        loadingText="Confirmando…"
                        disabled={ocupado !== null && ocupado !== "confirmar"}
                    >
                        Confirmar pedido
                    </Button>
                </form>
            </div>
        </>
    );
}
