import { useState } from "react";
import { formatDiaMes } from "../../utils/fechas.js";
import { formatCantidad, formatPrecio } from "../../utils/formatters.js";
import styles from "./GraficoVentas.module.css";

const compacto = new Intl.NumberFormat("es-AR", { notation: "compact", maximumFractionDigits: 1 });

// Escala con números redondos: 4 tramos de 1, 2, 2,5 o 5 por potencia de 10.
function escalaRedonda(maximo) {
    if (maximo <= 0) return { tope: 1, marcas: [0] };
    const crudo = maximo / 4;
    const potencia = 10 ** Math.floor(Math.log10(crudo));
    const paso = [1, 2, 2.5, 5, 10].map((factor) => factor * potencia).find((valor) => valor >= crudo);
    const tope = paso * Math.ceil(maximo / paso);
    return { tope, marcas: Array.from({ length: Math.round(tope / paso) + 1 }, (_, indice) => indice * paso) };
}

// Más de 62 días se agrupan por semana: las columnas diarias quedarían de un píxel.
function agruparVentas(porDia) {
    if (porDia.length <= 62) return { unidad: "día", barras: porDia.map((dia) => ({ ...dia, hasta: dia.fecha })) };
    const barras = [];
    for (let inicio = 0; inicio < porDia.length; inicio += 7) {
        const semana = porDia.slice(inicio, inicio + 7);
        barras.push({
            fecha: semana[0].fecha,
            hasta: semana.at(-1).fecha,
            total: Math.round(semana.reduce((suma, dia) => suma + dia.total * 100, 0)) / 100,
            pedidos: semana.reduce((suma, dia) => suma + dia.pedidos, 0)
        });
    }
    return { unidad: "semana", barras };
}

// Qué fechas del eje se escriben: la primera y la última siempre; la del medio y las intermedias,
// solo si el gráfico es lo bastante ancho (lo decide una container query en el CSS).
function nivelFecha(indice, cantidad, paso) {
    if (indice === 0) return "primera";
    if (indice === cantidad - 1) return "ultima";
    if (indice % paso !== 0 || cantidad - 1 - indice < paso / 2) return undefined;
    // La del medio es la marca intermedia más cercana al centro: así nunca quedan dos pegadas.
    const medio = Math.round((cantidad - 1) / 2 / paso) * paso;
    return indice === medio ? "medio" : "intermedia";
}

function etiquetaBarra(barra, unidad) {
    return unidad === "día" ? formatDiaMes(barra.fecha) : `${formatDiaMes(barra.fecha)} al ${formatDiaMes(barra.hasta)}`;
}

// Columnas de una sola serie (sin leyenda: el título dice qué se mide). Al señalar una columna,
// o recorrerlas con las flechas, aparece su detalle; los mismos datos están en la tabla.
export default function GraficoVentas({ porDia, actualizando = false }) {
    const [activa, setActiva] = useState(null);
    const { unidad, barras } = agruparVentas(porDia);
    const maximo = Math.max(...barras.map((barra) => barra.total));
    const { tope, marcas } = escalaRedonda(maximo);
    const indiceMaximo = maximo > 0 ? barras.findIndex((barra) => barra.total === maximo) : -1;
    const paso = barras.length <= 8 ? 1 : Math.ceil(barras.length / 6);
    const seleccionada = activa === null ? null : barras[activa];

    function alPresionarTecla(event) {
        const ultima = barras.length - 1;
        const destinos = {
            ArrowRight: Math.min((activa ?? -1) + 1, ultima),
            ArrowLeft: Math.max((activa ?? ultima + 1) - 1, 0),
            Home: 0,
            End: ultima
        };
        if (!(event.key in destinos)) return;
        event.preventDefault();
        setActiva(destinos[event.key]);
    }

    const descripcion = seleccionada
        ? `${etiquetaBarra(seleccionada, unidad)}: ${formatPrecio(seleccionada.total)}, ${formatCantidad(seleccionada.pedidos, "pedido entregado", "pedidos entregados")}.`
        : "";

    return (
        <figure className={styles.grafico} data-actualizando={actualizando || undefined}>
            <div
                className={styles.plano}
                tabIndex={0}
                role="group"
                aria-label={`Ventas por ${unidad}. Usá las flechas para recorrer ${unidad === "día" ? "los días" : "las semanas"}.`}
                onKeyDown={alPresionarTecla}
                onPointerLeave={() => setActiva(null)}
                onBlur={() => setActiva(null)}
            >
                <div className={styles.eje} aria-hidden="true">
                    {marcas.map((marca) => (
                        <span key={marca} className={`${styles.marca} tabular`} style={{ "--posicion": `${(marca / tope) * 100}%` }}>
                            {marca === 0 ? "$ 0" : `$ ${compacto.format(marca)}`}
                        </span>
                    ))}
                </div>
                <div className={styles.area}>
                    {marcas.map((marca) => (
                        <span key={marca} className={styles.grilla} style={{ "--posicion": `${(marca / tope) * 100}%` }} aria-hidden="true" />
                    ))}
                    <div className={styles.columnas} style={{ "--cantidad": barras.length }} aria-hidden="true">
                        {barras.map((barra, indice) => (
                            <div
                                key={barra.fecha}
                                className={styles.columna}
                                data-activa={activa === indice || undefined}
                                onPointerEnter={() => setActiva(indice)}
                            >
                                {barra.total > 0 ? (
                                    <span className={styles.barra} style={{ "--alto": `${(barra.total / tope) * 100}%` }}>
                                        {indice === indiceMaximo ? (
                                            <span className={`${styles.rotulo} tabular`}>{formatPrecio(barra.total)}</span>
                                        ) : null}
                                    </span>
                                ) : null}
                            </div>
                        ))}
                    </div>
                    {maximo === 0 ? <p className={styles.sinVentas}>No hubo ventas entregadas en este período.</p> : null}
                    {seleccionada ? (
                        <div
                            className={styles.detalle}
                            style={{ "--x": `${((activa + 0.5) / barras.length) * 100}%` }}
                            data-lado={activa > barras.length / 2 ? "izquierda" : "derecha"}
                            aria-hidden="true"
                        >
                            <strong className="tabular">{formatPrecio(seleccionada.total)}</strong>
                            <span>{etiquetaBarra(seleccionada, unidad)} · {formatCantidad(seleccionada.pedidos, "pedido", "pedidos")}</span>
                        </div>
                    ) : null}
                </div>
                <div className={styles.fechas} style={{ "--cantidad": barras.length }} aria-hidden="true">
                    {barras.map((barra, indice) => (
                        <span key={barra.fecha} className="tabular" data-nivel={nivelFecha(indice, barras.length, paso)}>
                            {nivelFecha(indice, barras.length, paso) ? formatDiaMes(barra.fecha) : ""}
                        </span>
                    ))}
                </div>
            </div>
            <p className="visually-hidden" aria-live="polite">{descripcion}</p>

            <details className={styles.tabla}>
                <summary>Ver los datos en una tabla</summary>
                <table>
                    <caption className="visually-hidden">Ventas por {unidad}</caption>
                    <thead>
                        <tr>
                            <th scope="col">{unidad === "día" ? "Día" : "Semana"}</th>
                            <th scope="col" className={styles.numero}>Pedidos entregados</th>
                            <th scope="col" className={styles.numero}>Vendido</th>
                        </tr>
                    </thead>
                    <tbody>
                        {barras.map((barra) => (
                            <tr key={barra.fecha}>
                                <th scope="row" className="tabular">{etiquetaBarra(barra, unidad)}</th>
                                <td className={`${styles.numero} tabular`}>{barra.pedidos}</td>
                                <td className={`${styles.numero} tabular`}>{formatPrecio(barra.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </details>
        </figure>
    );
}
