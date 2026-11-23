import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ClipboardList, Plus, SearchX, TriangleAlert } from "lucide-react";
import EncabezadoPanel from "../components/layout/EncabezadoPanel.jsx";
import EstadoPedidoBadge from "../components/pedidos/EstadoPedidoBadge.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import Segmentos from "../components/ui/Segmentos.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import TextField from "../components/ui/TextField.jsx";
import { useRecurso } from "../hooks/useRecurso.js";
import { cambiarEstadoPedido, getPedidos } from "../services/pedidosService.js";
import { describirRetiro, formatFechaHora, hoyEnElLocal } from "../utils/fechas.js";
import { formatCantidad, formatPrecio } from "../utils/formatters.js";
import { notify } from "../utils/notify.js";
import { ESTADO, ETIQUETA_ESTADO, estaActivo, estaAtrasado, resumirProductos, siguientePaso } from "../utils/pedidos.js";
import styles from "./AdminPedidosPage.module.css";

const VISTAS = [
    { valor: "en-curso", etiqueta: "En curso", estados: [ESTADO.PENDIENTE, ESTADO.LISTO_PARA_RETIRAR] },
    { valor: "pendientes", etiqueta: "Pendientes", estados: [ESTADO.PENDIENTE] },
    { valor: "listos", etiqueta: "Listos para retirar", estados: [ESTADO.LISTO_PARA_RETIRAR] },
    { valor: "entregados", etiqueta: "Entregados", estados: [ESTADO.ENTREGADO] },
    { valor: "cerrados", etiqueta: "Cancelados y vencidos", estados: [ESTADO.CANCELADO, ESTADO.VENCIDO] },
    { valor: "todos", etiqueta: "Todos", estados: Object.values(ESTADO) }
];

const clavePedido = (pedido) => `${pedido.fechaRetiro} ${pedido.horaRetiro}`;

// Los que están en curso se ordenan por retiro (lo próximo arriba); los cerrados, del más nuevo al más viejo.
function ordenar(pedidos) {
    return [...pedidos].sort((a, b) => {
        if (estaActivo(a) !== estaActivo(b)) return estaActivo(a) ? -1 : 1;
        if (estaActivo(a)) return clavePedido(a).localeCompare(clavePedido(b)) || a.idPedido - b.idPedido;
        return b.idPedido - a.idPedido;
    });
}

function coincide(pedido, texto) {
    const normalizar = (valor) => valor.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
    return normalizar(`${pedido.codigo} ${pedido.cliente.nombre} ${pedido.cliente.contacto}`).includes(normalizar(texto.trim()));
}

function resumen(pedidos, hoy) {
    const pendientes = pedidos.filter((pedido) => pedido.estado === ESTADO.PENDIENTE).length;
    const listos = pedidos.filter((pedido) => pedido.estado === ESTADO.LISTO_PARA_RETIRAR).length;
    const paraHoy = pedidos.filter((pedido) => estaActivo(pedido) && pedido.fechaRetiro === hoy).length;
    if (pendientes + listos === 0) return "No hay pedidos en curso.";
    const partes = [`${formatCantidad(pendientes, "pendiente", "pendientes")} de preparar`];
    partes.push(`${formatCantidad(listos, "listo", "listos")} para retirar`);
    return `${partes.join(" y ")}. ${paraHoy === 0 ? "Ninguno se retira hoy." : `${formatCantidad(paraHoy, "se retira", "se retiran")} hoy.`}`;
}

export default function AdminPedidosPage() {
    const [params, setParams] = useSearchParams();
    const vista = VISTAS.find((opcion) => opcion.valor === params.get("vista")) ?? VISTAS[0];
    const busqueda = params.get("q") ?? "";
    const pedidos = useRecurso((signal) => getPedidos({ signal }), { idAviso: "carga-pedidos" });
    const [enCurso, setEnCurso] = useState(null);
    const hoy = hoyEnElLocal();

    function cambiarParam(clave, valor, porDefecto) {
        const nuevos = new URLSearchParams(params);
        if (valor === porDefecto || valor === "") nuevos.delete(clave);
        else nuevos.set(clave, valor);
        setParams(nuevos, { replace: true });
    }

    async function avanzar(pedido) {
        const paso = siguientePaso(pedido);
        setEnCurso(pedido.idPedido);
        try {
            const actualizado = await cambiarEstadoPedido(pedido.idPedido, paso.estado);
            pedidos.reemplazar((lista) => lista.map((item) => (item.idPedido === actualizado.idPedido ? actualizado : item)));
            notify.success(`${actualizado.codigo}: ${ETIQUETA_ESTADO[actualizado.estado].toLowerCase()}`, {
                description: actualizado.estado === ESTADO.ENTREGADO ? "La venta ya cuenta en los reportes." : `Retira ${describirRetiro(actualizado).toLowerCase()}.`
            });
        } catch (error) {
            notify.error(error, { id: "estado-pedido" });
            if (error.status === 409 || error.status === 404) pedidos.recargar();
        } finally {
            setEnCurso(null);
        }
    }

    const todos = pedidos.datos ?? [];
    const cargandoPrimeraVez = pedidos.status === "loading" && !pedidos.datos;
    const visibles = ordenar(todos.filter((pedido) => vista.estados.includes(pedido.estado) && (!busqueda || coincide(pedido, busqueda))));
    const opciones = VISTAS.map((opcion) => ({
        valor: opcion.valor,
        etiqueta: opcion.etiqueta,
        detalle: pedidos.datos ? todos.filter((pedido) => opcion.estados.includes(pedido.estado)).length : undefined
    }));

    let contenido;
    if (cargandoPrimeraVez) {
        contenido = (
            <div className={styles.esqueleto} role="status">
                <span className="visually-hidden">Cargando pedidos…</span>
                {[0, 1, 2, 3].map((numero) => (
                    <div key={numero} className={styles.esqueletoFila}>
                        <Skeleton width="72px" height="1.1rem" />
                        <Skeleton width="30%" height="1.1rem" />
                        <Skeleton width="20%" height="1.1rem" />
                        <Skeleton width="120px" height="44px" />
                    </div>
                ))}
            </div>
        );
    } else if (pedidos.status === "error" && !pedidos.datos) {
        contenido = <ErrorState as="h2" titulo="No pudimos cargar los pedidos" error={pedidos.error} onRetry={pedidos.recargar} />;
    } else if (todos.length === 0) {
        contenido = (
            <EmptyState
                icon={<ClipboardList size={28} />}
                titulo="Todavía no hay pedidos"
                accion={<Button to="/admin/pedidos/nuevo" icon={<Plus size={18} aria-hidden="true" />}>Registrar un pedido</Button>}
            >
                <p>Cuando alguien te pida algo por Instagram, cargalo acá: se descuenta el stock y queda en el historial del cliente.</p>
            </EmptyState>
        );
    } else if (visibles.length === 0) {
        contenido = (
            <EmptyState
                icon={<SearchX size={28} />}
                titulo={busqueda ? `Ningún pedido coincide con «${busqueda}»` : `No hay pedidos en «${vista.etiqueta}»`}
                accion={busqueda
                    ? <Button variant="secondary" onClick={() => cambiarParam("q", "", "")}>Limpiar la búsqueda</Button>
                    : <Button variant="secondary" onClick={() => cambiarParam("vista", "todos", VISTAS[0].valor)}>Ver todos los pedidos</Button>}
            />
        );
    } else {
        contenido = <ListaPedidos pedidos={visibles} hoy={hoy} enCurso={enCurso} onAvanzar={avanzar} />;
    }

    return (
        <>
            <title>Pedidos · Panel · RED Suplementos</title>
            <EncabezadoPanel
                titulo="Pedidos"
                accion={<Button to="/admin/pedidos/nuevo" icon={<Plus size={18} aria-hidden="true" />}>Nuevo pedido</Button>}
            >
                {cargandoPrimeraVez ? <Skeleton width="min(100%, 420px)" height="1.55em" /> : null}
                {pedidos.datos ? <p className={styles.resumen}>{resumen(todos, hoy)}</p> : null}
            </EncabezadoPanel>

            <div className={styles.filtros}>
                <Segmentos
                    leyenda="Ver pedidos"
                    ocultarLeyenda
                    opciones={opciones}
                    valor={vista.valor}
                    onCambiar={(valor) => cambiarParam("vista", valor, VISTAS[0].valor)}
                />
                <div className={styles.busqueda}>
                    <TextField
                        label="Buscar por código o cliente"
                        type="search"
                        value={busqueda}
                        onChange={(event) => cambiarParam("q", event.target.value, "")}
                        autoComplete="off"
                        placeholder="RED-0007, Juan, @usuario"
                    />
                </div>
            </div>

            <div className={styles.contenido} aria-busy={pedidos.status === "loading"}>{contenido}</div>
        </>
    );
}

function Retiro({ pedido, hoy }) {
    const atrasado = estaAtrasado(pedido, hoy);
    return (
        <span className={styles.retiro}>
            <span className={pedido.fechaRetiro === hoy && estaActivo(pedido) ? styles.hoy : undefined}>{describirRetiro(pedido, hoy)}</span>
            {atrasado ? <Badge tono="warning" icon={<TriangleAlert size={16} aria-hidden="true" />}>No lo retiró</Badge> : null}
        </span>
    );
}

function Cliente({ pedido }) {
    return (
        <span className={styles.cliente}>
            <span className={styles.nombre}>{pedido.cliente.nombre}</span>
            <span className={styles.secundario}>
                {pedido.idCliente ? "Con cuenta" : "Sin cuenta"} · {pedido.cliente.contacto}
            </span>
        </span>
    );
}

function Accion({ pedido, enCurso, onAvanzar }) {
    const paso = siguientePaso(pedido);
    if (!paso) return <Link to={`/admin/pedidos/${pedido.idPedido}`} className={styles.ver}>Ver detalle</Link>;
    return (
        <Button
            variant="tonal"
            onClick={() => onAvanzar(pedido)}
            loading={enCurso === pedido.idPedido}
            loadingText="Guardando…"
            disabled={enCurso !== null && enCurso !== pedido.idPedido}
            aria-label={`${paso.etiqueta}: ${pedido.codigo}`}
        >
            {paso.corta}
        </Button>
    );
}

// Tabla desde 860 px y tarjetas apiladas en el teléfono (como en Productos).
function ListaPedidos({ pedidos, hoy, enCurso, onAvanzar }) {
    return (
        <>
            <table className={styles.tabla}>
                <caption className="visually-hidden">Pedidos</caption>
                <thead>
                    <tr>
                        <th scope="col">Pedido</th>
                        <th scope="col">Cliente</th>
                        <th scope="col">Retiro</th>
                        <th scope="col">Productos</th>
                        <th scope="col" className={styles.numero}>Total</th>
                        <th scope="col">Estado</th>
                        <th scope="col"><span className="visually-hidden">Acción</span></th>
                    </tr>
                </thead>
                <tbody>
                    {pedidos.map((pedido) => (
                        <tr key={pedido.idPedido}>
                            <th scope="row">
                                <Link to={`/admin/pedidos/${pedido.idPedido}`} className={styles.codigo}>{pedido.codigo}</Link>
                                <span className={`${styles.secundario} tabular`}>{formatFechaHora(pedido.fechaCreacion)}</span>
                            </th>
                            <td><Cliente pedido={pedido} /></td>
                            <td><Retiro pedido={pedido} hoy={hoy} /></td>
                            <td><span className={styles.productos}>{resumirProductos(pedido.detalles)}</span></td>
                            <td className={`${styles.numero} tabular`}>{formatPrecio(pedido.total)}</td>
                            <td><EstadoPedidoBadge estado={pedido.estado} /></td>
                            <td className={styles.accion}><Accion pedido={pedido} enCurso={enCurso} onAvanzar={onAvanzar} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <ul className={styles.lista} aria-label="Pedidos">
                {pedidos.map((pedido) => (
                    <li key={pedido.idPedido} className={styles.tarjeta}>
                        <div className={styles.tarjetaArriba}>
                            <Link to={`/admin/pedidos/${pedido.idPedido}`} className={styles.codigo}>{pedido.codigo}</Link>
                            <EstadoPedidoBadge estado={pedido.estado} />
                        </div>
                        <Cliente pedido={pedido} />
                        <Retiro pedido={pedido} hoy={hoy} />
                        <span className={styles.productos}>{resumirProductos(pedido.detalles)}</span>
                        <div className={styles.tarjetaAbajo}>
                            <strong className="tabular">{formatPrecio(pedido.total)}</strong>
                            <Accion pedido={pedido} enCurso={enCurso} onAvanzar={onAvanzar} />
                        </div>
                    </li>
                ))}
            </ul>
        </>
    );
}
