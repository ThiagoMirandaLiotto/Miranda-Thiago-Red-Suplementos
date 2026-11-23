import { useState } from "react";
import { BadgeCheck, Clock, SearchX, UserRound, Users } from "lucide-react";
import EncabezadoPanel from "../components/layout/EncabezadoPanel.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import TextField from "../components/ui/TextField.jsx";
import { useRecurso } from "../hooks/useRecurso.js";
import { cambiarMembresia, getClientes } from "../services/clientesService.js";
import { NEGOCIO } from "../utils/constants.js";
import { formatFechaHora } from "../utils/fechas.js";
import { formatCantidad } from "../utils/formatters.js";
import { notify } from "../utils/notify.js";
import styles from "./AdminClientesPage.module.css";

function normalizar(texto) {
    return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function Membresia({ cliente }) {
    if (cliente.membresiaActiva) {
        return <Badge tono="success" icon={<BadgeCheck size={16} aria-hidden="true" />}>Socio verificado · {NEGOCIO.descuentoSocios} %</Badge>;
    }
    if (cliente.esSocioGym) return <Badge tono="warning" icon={<Clock size={16} aria-hidden="true" />}>Dice ser socio: verificar</Badge>;
    return <Badge tono="neutral" icon={<UserRound size={16} aria-hidden="true" />}>No es socio</Badge>;
}

// RN-09: el 10 % se aplica solo cuando el local verificó la membresía en RED GYM.
export default function AdminClientesPage() {
    const clientes = useRecurso((signal) => getClientes({ signal }), { idAviso: "carga-clientes" });
    const [busqueda, setBusqueda] = useState("");
    const [guardando, setGuardando] = useState(null);

    async function cambiar(cliente, membresiaActiva) {
        setGuardando(cliente.idUsuario);
        try {
            const actualizado = await cambiarMembresia(cliente.idUsuario, membresiaActiva);
            clientes.reemplazar((lista) => lista.map((item) => (item.idUsuario === actualizado.idUsuario ? { ...item, ...actualizado } : item)));
            const nombre = `${actualizado.nombre} ${actualizado.apellido}`;
            notify.success(membresiaActiva ? `Verificaste la membresía de ${nombre}` : `Quitaste la membresía de ${nombre}`, {
                description: membresiaActiva
                    ? `Sus próximos pedidos tienen ${NEGOCIO.descuentoSocios} % de descuento.`
                    : "Sus próximos pedidos van sin descuento."
            });
        } catch (error) {
            notify.error(error, { id: "membresia" });
            if (error.status === 404) clientes.recargar();
        } finally {
            setGuardando(null);
        }
    }

    const todos = clientes.datos ?? [];
    const texto = normalizar(busqueda.trim());
    const visibles = todos.filter((cliente) => !texto
        || normalizar(`${cliente.nombre} ${cliente.apellido} ${cliente.email} ${cliente.telefono}`).includes(texto));
    const paraVerificar = todos.filter((cliente) => cliente.esSocioGym && !cliente.membresiaActiva).length;

    let contenido;
    if (clientes.status === "loading" && !clientes.datos) {
        contenido = (
            <div className={styles.esqueleto} role="status">
                <span className="visually-hidden">Cargando clientes…</span>
                {[0, 1, 2].map((numero) => <Skeleton key={numero} height="64px" />)}
            </div>
        );
    } else if (!clientes.datos) {
        contenido = <ErrorState as="h2" titulo="No pudimos cargar los clientes" error={clientes.error} onRetry={clientes.recargar} />;
    } else if (todos.length === 0) {
        contenido = (
            <EmptyState icon={<Users size={28} />} titulo="Todavía no hay clientes con cuenta">
                <p>Se registran desde la página. Con cuenta, siguen sus pedidos y, si son socios verificados, tienen el 10 %.</p>
            </EmptyState>
        );
    } else if (visibles.length === 0) {
        contenido = (
            <EmptyState
                icon={<SearchX size={28} />}
                titulo={`Ningún cliente coincide con «${busqueda.trim()}»`}
                accion={<Button variant="secondary" onClick={() => setBusqueda("")}>Limpiar la búsqueda</Button>}
            />
        );
    } else {
        contenido = (
            <ul className={styles.lista} aria-label="Clientes con cuenta">
                {visibles.map((cliente) => (
                    <li key={cliente.idUsuario} className={styles.cliente}>
                        <div className={styles.datos}>
                            <span className={styles.nombre}>{cliente.nombre} {cliente.apellido}</span>
                            <span className={styles.secundario}>{cliente.email} · {cliente.telefono}</span>
                            <span className={`${styles.secundario} tabular`}>
                                Alta {formatFechaHora(cliente.fechaAlta)} · {formatCantidad(cliente.cantidadPedidos, "pedido", "pedidos")}
                            </span>
                        </div>
                        <Membresia cliente={cliente} />
                        <div className={styles.accion}>
                            {cliente.membresiaActiva ? (
                                <Button
                                    variant="dangerGhost"
                                    onClick={() => cambiar(cliente, false)}
                                    loading={guardando === cliente.idUsuario}
                                    loadingText="Guardando…"
                                    disabled={guardando !== null && guardando !== cliente.idUsuario}
                                    aria-label={`Quitar membresía de ${cliente.nombre} ${cliente.apellido}`}
                                >
                                    Quitar membresía
                                </Button>
                            ) : (
                                <Button
                                    variant="tonal"
                                    onClick={() => cambiar(cliente, true)}
                                    loading={guardando === cliente.idUsuario}
                                    loadingText="Guardando…"
                                    disabled={guardando !== null && guardando !== cliente.idUsuario}
                                    aria-label={`Verificar membresía de ${cliente.nombre} ${cliente.apellido}`}
                                >
                                    Verificar membresía
                                </Button>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <>
            <title>Clientes · Panel · RED Suplementos</title>
            <EncabezadoPanel titulo="Clientes">
                {clientes.datos ? (
                    <p className={styles.resumen}>
                        {formatCantidad(todos.length, "cliente con cuenta", "clientes con cuenta")}.{" "}
                        {paraVerificar
                            ? `${formatCantidad(paraVerificar, "dice ser socio y falta", "dicen ser socios y falta")} verificar${paraVerificar === 1 ? "lo" : "los"} en el mostrador.`
                            : "No hay membresías para verificar."}
                    </p>
                ) : <Skeleton width="min(100%, 380px)" height="1.55em" />}
            </EncabezadoPanel>
            <div className={styles.filtros}>
                <TextField
                    label="Buscar cliente"
                    type="search"
                    value={busqueda}
                    onChange={(event) => setBusqueda(event.target.value)}
                    placeholder="Nombre, email o teléfono"
                    autoComplete="off"
                />
            </div>
            <div className={styles.contenido} aria-busy={clientes.status === "loading"}>{contenido}</div>
        </>
    );
}
