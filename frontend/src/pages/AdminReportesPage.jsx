import { Link, useSearchParams } from "react-router";
import { PackagePlus } from "lucide-react";
import EncabezadoPanel from "../components/layout/EncabezadoPanel.jsx";
import EstadoPedidoBadge from "../components/pedidos/EstadoPedidoBadge.jsx";
import StockBadge from "../components/productos/StockBadge.jsx";
import GraficoVentas from "../components/reportes/GraficoVentas.jsx";
import RankingProductos from "../components/reportes/RankingProductos.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import Segmentos from "../components/ui/Segmentos.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import TextField from "../components/ui/TextField.jsx";
import { useRecurso } from "../hooks/useRecurso.js";
import { getCancelados, getMasVendidos, getStockCritico, getVentas } from "../services/reportesService.js";
import { diasEntre, formatDiaMes, formatFechaHora, hoyEnElLocal, sumarDias } from "../utils/fechas.js";
import { formatCantidad, formatPrecio } from "../utils/formatters.js";
import styles from "./AdminReportesPage.module.css";

const PERIODOS = [
    { valor: "7", etiqueta: "Últimos 7 días" },
    { valor: "30", etiqueta: "Últimos 30 días" },
    { valor: "mes", etiqueta: "Este mes" },
    { valor: "otro", etiqueta: "Otro período" }
];

// El período vive en la URL: se puede volver atrás o compartir el mismo reporte.
function leerPeriodo(params, hoy) {
    const tipo = PERIODOS.some((opcion) => opcion.valor === params.get("periodo")) ? params.get("periodo") : "30";
    if (tipo === "7") return { tipo, desde: sumarDias(hoy, -6), hasta: hoy };
    if (tipo === "mes") return { tipo, desde: `${hoy.slice(0, 8)}01`, hasta: hoy };
    if (tipo === "otro") {
        const desde = params.get("desde") ?? sumarDias(hoy, -29);
        const hasta = params.get("hasta") ?? hoy;
        const valido = /^\d{4}-\d{2}-\d{2}$/.test(desde) && /^\d{4}-\d{2}-\d{2}$/.test(hasta)
            && desde <= hasta && diasEntre(desde, hasta) <= 365;
        return { tipo, desde, hasta, error: valido ? null : "Elegí un «desde» anterior o igual al «hasta», con hasta un año de diferencia." };
    }
    return { tipo, desde: sumarDias(hoy, -29), hasta: hoy };
}

async function cargarReportes(periodo, signal) {
    const [ventas, masVendidos, cancelados] = await Promise.all([
        getVentas(periodo, signal),
        getMasVendidos(periodo, signal),
        getCancelados(periodo, signal)
    ]);
    return { ventas, masVendidos, cancelados };
}

// F-08: ventas por período, más vendidos, cancelados y stock crítico, para decidir la reposición.
export default function AdminReportesPage() {
    const [params, setParams] = useSearchParams();
    const hoy = hoyEnElLocal();
    const periodo = leerPeriodo(params, hoy);
    const consulta = periodo.error ? null : { desde: periodo.desde, hasta: periodo.hasta };
    const reportes = useRecurso(
        (signal) => (consulta ? cargarReportes(consulta, signal) : new Promise(() => {})),
        { clave: consulta ? `${consulta.desde}_${consulta.hasta}` : "invalido", idAviso: "carga-reportes" }
    );
    const stock = useRecurso((signal) => getStockCritico(signal), { idAviso: "carga-stock-critico" });

    function cambiarPeriodo(cambios) {
        const nuevos = new URLSearchParams(params);
        for (const [clave, valor] of Object.entries(cambios)) {
            if (valor === null) nuevos.delete(clave);
            else nuevos.set(clave, valor);
        }
        setParams(nuevos, { replace: true });
    }

    const datos = reportes.datos;
    const actualizando = reportes.status === "loading" && Boolean(datos);

    return (
        <>
            <title>Reportes · Panel · RED Suplementos</title>
            <EncabezadoPanel titulo="Reportes">
                <p className={styles.bajada}>
                    Una venta es un pedido entregado: se paga al retirarlo. Período del {formatDiaMes(periodo.desde)} al {formatDiaMes(periodo.hasta)}.
                </p>
            </EncabezadoPanel>

            <div className={styles.filtros}>
                <Segmentos
                    leyenda="Período"
                    ocultarLeyenda
                    opciones={PERIODOS}
                    valor={periodo.tipo}
                    onCambiar={(valor) => cambiarPeriodo(valor === "otro"
                        ? { periodo: valor, desde: periodo.desde, hasta: periodo.hasta }
                        : { periodo: valor === "30" ? null : valor, desde: null, hasta: null })}
                />
                {periodo.tipo === "otro" ? (
                    <div className={styles.rango}>
                        <TextField
                            label="Desde"
                            type="date"
                            value={periodo.desde}
                            max={hoy}
                            onChange={(event) => event.target.value && cambiarPeriodo({ desde: event.target.value })}
                            error={periodo.error ?? undefined}
                        />
                        <TextField
                            label="Hasta"
                            type="date"
                            value={periodo.hasta}
                            max={hoy}
                            onChange={(event) => event.target.value && cambiarPeriodo({ hasta: event.target.value })}
                        />
                    </div>
                ) : null}
            </div>

            {reportes.status === "error" && !datos ? (
                <div className={styles.seccion}>
                    <ErrorState as="h2" titulo="No pudimos cargar los reportes" error={reportes.error} onRetry={reportes.recargar} />
                </div>
            ) : (
                <div className={styles.grilla} aria-busy={reportes.status === "loading"}>
                    <Cifras ventas={datos?.ventas} cancelados={datos?.cancelados} actualizando={actualizando} />

                    <section className={`${styles.seccion} ${styles.ancho}`} aria-labelledby="ventas-titulo">
                        <h2 id="ventas-titulo" className={styles.subtitulo}>Ventas por día</h2>
                        {datos ? <GraficoVentas porDia={datos.ventas.porDia} actualizando={actualizando} /> : <Skeleton height="260px" />}
                    </section>

                    <section className={styles.seccion} aria-labelledby="mas-vendidos-titulo">
                        <h2 id="mas-vendidos-titulo" className={styles.subtitulo}>Más vendidos</h2>
                        {!datos ? <Skeleton height="200px" /> : datos.masVendidos.productos.length === 0 ? (
                            <p className={styles.vacio}>No hubo ventas entregadas en este período.</p>
                        ) : (
                            <div data-actualizando={actualizando || undefined} className={styles.atenuable}>
                                <RankingProductos productos={datos.masVendidos.productos} />
                                <p className={styles.nota}>Importe a precio de lista, antes del descuento de socios.</p>
                            </div>
                        )}
                    </section>

                    <section className={styles.seccion} aria-labelledby="stock-titulo">
                        <h2 id="stock-titulo" className={styles.subtitulo}>Stock crítico</h2>
                        <StockCritico estado={stock} />
                    </section>

                    <section className={`${styles.seccion} ${styles.ancho}`} aria-labelledby="cancelados-titulo">
                        <h2 id="cancelados-titulo" className={styles.subtitulo}>Cancelados y vencidos</h2>
                        {!datos ? <Skeleton height="120px" /> : (
                            <div data-actualizando={actualizando || undefined} className={styles.atenuable}>
                                <Cancelados datos={datos.cancelados} />
                            </div>
                        )}
                    </section>
                </div>
            )}
        </>
    );
}

// Cuatro cifras de un vistazo, en una sola franja: sin tarjetas ni íconos.
function Cifras({ ventas, cancelados, actualizando }) {
    if (!ventas) return <Skeleton height="96px" className={styles.ancho} />;
    const cerrados = cancelados.cancelados + cancelados.vencidos;
    const cifras = [
        { etiqueta: "Vendido", valor: formatPrecio(ventas.total), nota: ventas.descuentos > 0 ? `Con ${formatPrecio(ventas.descuentos)} de descuento a socios` : null },
        { etiqueta: "Pedidos entregados", valor: ventas.pedidos, nota: formatCantidad(ventas.unidades, "unidad", "unidades") },
        { etiqueta: "Ticket promedio", valor: formatPrecio(ventas.ticketPromedio), nota: null },
        {
            etiqueta: "Cancelados y vencidos",
            valor: cerrados,
            nota: cerrados
                ? `${formatCantidad(cancelados.cancelados, "cancelado", "cancelados")} · ${formatCantidad(cancelados.vencidos, "vencido", "vencidos")}`
                : null
        }
    ];
    return (
        <dl className={`${styles.cifras} ${styles.ancho}`} data-actualizando={actualizando || undefined}>
            {cifras.map((cifra) => (
                <div key={cifra.etiqueta} className={styles.cifra}>
                    <dt>{cifra.etiqueta}</dt>
                    <dd>
                        <span className={styles.valor}>{cifra.valor}</span>
                        {cifra.nota ? <span className={styles.notaCifra}>{cifra.nota}</span> : null}
                    </dd>
                </div>
            ))}
        </dl>
    );
}

function StockCritico({ estado }) {
    if (!estado.datos && estado.status === "loading") return <Skeleton height="160px" />;
    if (!estado.datos) return <ErrorState as="h3" titulo="No pudimos cargar el stock" error={estado.error} onRetry={estado.recargar} />;
    if (estado.datos.length === 0) return <p className={styles.vacio}>Todos los productos están por encima de su mínimo.</p>;
    return (
        <ul className={styles.criticos}>
            {estado.datos.map((producto) => (
                <li key={producto.idProducto} className={styles.critico}>
                    <span className={styles.nombre}>
                        {producto.nombre}
                        <span className={`${styles.nota} tabular`}>Hay {producto.stock} · mínimo {producto.stockMinimo}</span>
                    </span>
                    <StockBadge producto={producto} contexto="panel" />
                    <Link to={`/admin/productos/${producto.idProducto}/stock`} className={styles.reponer}>
                        <PackagePlus size={16} aria-hidden="true" />
                        Cargar ingreso
                        <span className="visually-hidden"> de {producto.nombre}</span>
                    </Link>
                </li>
            ))}
        </ul>
    );
}

function Cancelados({ datos }) {
    if (datos.pedidos.length === 0) return <p className={styles.vacio}>No hubo pedidos cancelados ni vencidos en este período.</p>;
    // En el teléfono la tabla se desplaza de costado dentro de su caja; la página no.
    return (
        <div className={styles.desplazable} tabIndex={0} role="region" aria-label="Tabla de cancelados y vencidos">
            <table className={styles.tabla}>
                <caption className="visually-hidden">Pedidos cancelados y vencidos del período</caption>
                <thead>
                    <tr>
                        <th scope="col">Pedido</th>
                        <th scope="col">Estado</th>
                        <th scope="col" className={styles.ocultable}>Cliente</th>
                        <th scope="col">Motivo</th>
                        <th scope="col" className={styles.numero}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {datos.pedidos.map((pedido) => (
                        <tr key={pedido.idPedido}>
                            <th scope="row">
                                <Link to={`/admin/pedidos/${pedido.idPedido}`} className={styles.codigo}>{pedido.codigo}</Link>
                                <span className={`${styles.nota} tabular`}>{formatFechaHora(pedido.fecha)}</span>
                            </th>
                            <td><EstadoPedidoBadge estado={pedido.estado} /></td>
                            <td className={styles.ocultable}>{pedido.cliente}</td>
                            <td className={styles.motivo}>{pedido.motivo}</td>
                            <td className={`${styles.numero} tabular`}>{formatPrecio(pedido.total)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
