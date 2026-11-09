import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import { ArrowRight } from "lucide-react";
import ProductoImagen from "../components/productos/ProductoImagen.jsx";
import ProductoCard from "../components/productos/ProductoCard.jsx";
import StockBadge from "../components/productos/StockBadge.jsx";
import BotonComprar from "../components/productos/BotonComprar.jsx";
import Marquesina from "../components/landing/Marquesina.jsx";
import Button from "../components/ui/Button.jsx";
import BotonMovimiento from "../components/ui/BotonMovimiento.jsx";
import InstagramIcon from "../components/ui/InstagramIcon.jsx";
import Revelar from "../components/ui/Revelar.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import { useProducto } from "../hooks/useProducto.js";
import { useProductos } from "../hooks/useProductos.js";
import { useCategorias } from "../hooks/useCategorias.js";
import { useEstadoLocal } from "../hooks/useEstadoLocal.js";
import { useInclinacion } from "../hooks/usePuntero.js";
import { nombreCategoria } from "../utils/categorias.js";
import { formatPrecio } from "../utils/formatters.js";
import { mensajeDeError } from "../utils/notify.js";
import { urlMensajeDirecto } from "../utils/instagram.js";
import { INSTAGRAM, NEGOCIO } from "../utils/constants.js";
import fachada from "../assets/img/fachada-vertical-760.webp";
import stockGrande from "../assets/img/suplementos-mostrador-660.webp";
import stockChica from "../assets/img/suplementos-mostrador-440.webp";
import styles from "./ProductoPage.module.css";

const PASOS = [
    { verbo: "Elegís", texto: "Tocás «Comprar» y copiamos tu consulta con el producto, el sabor y el precio." },
    { verbo: "Escribís", texto: `Se abre el chat de @${INSTAGRAM.tienda.usuario} en Instagram: pegás la consulta y la mandás.` },
    { verbo: "Retirás", texto: `En el mostrador de ${NEGOCIO.gimnasio}, ${NEGOCIO.direccion}, ${NEGOCIO.localidad}. ${NEGOCIO.horario.texto}.` }
];

export default function ProductoPage() {
    const { id } = useParams();
    // Con otro id se monta una ficha nueva, sin datos del producto anterior.
    return <FichaProducto key={id} id={id} />;
}

// La página de cada producto: el bloque «placa cuadrada y texto justo» de la dirección.
// El producto domina la primera pantalla, sobre un panel gris cortado a 7°; al lado, el nombre y la compra.
// Después, cómo se compra y más productos.
function FichaProducto({ id }) {
    const { state } = useLocation();
    const inicial = state?.producto?.idProducto === Number(id) ? state.producto : null;
    const producto = useProducto(id, inicial);
    const categorias = useCategorias();
    const productos = useProductos();
    const estadoLocal = useEstadoLocal();
    const accionesRef = useRef(null);
    const [barraVisible, setBarraVisible] = useState(false);

    const p = producto.producto;
    const listo = producto.status === "success" && Boolean(p);
    const categoria = p
        ? (categorias.status === "success" ? nombreCategoria(categorias.mapaCategorias, p.idCategoria) : state?.categoria ?? "")
        : "";

    // La barra de compra baja de la barra principal cuando los botones de la ficha quedaron arriba,
    // y se va al llegar al footer. El observador de los botones cuenta como "a la vista" todo lo que
    // está debajo del borde superior: así registra el cruce aunque se salte de golpe (scroll rápido o volver atrás).
    useEffect(() => {
        const acciones = accionesRef.current;
        if (!listo || !acciones) return undefined;
        const footer = document.getElementById("contacto");
        let pasada = false;
        let enFooter = false;
        const actualizar = () => setBarraVisible(pasada && !enFooter);
        const observaAcciones = new IntersectionObserver(([entrada]) => {
            pasada = !entrada.isIntersecting;
            actualizar();
        }, { rootMargin: "0px 0px 100000px 0px" });
        const observaFooter = new IntersectionObserver(([entrada]) => {
            enFooter = entrada.isIntersecting;
            actualizar();
        });
        observaAcciones.observe(acciones);
        if (footer) observaFooter.observe(footer);
        return () => {
            observaAcciones.disconnect();
            observaFooter.disconnect();
        };
    }, [listo]);

    const relacionados = useMemo(() => {
        if (!p) return [];
        const otros = productos.productos.filter((otro) => otro.idProducto !== p.idProducto);
        const misma = otros.filter((otro) => otro.idCategoria === p.idCategoria);
        const resto = otros.filter((otro) => otro.idCategoria !== p.idCategoria);
        return [...misma, ...resto].slice(0, 3);
    }, [p, productos.productos]);

    let titulo = "Cargando producto…";
    if (listo) titulo = p.nombre;
    else if (producto.status === "not-found") titulo = "Este producto ya no está disponible";
    else if (producto.status === "error") titulo = "No pudimos cargar el producto";

    const pestana = listo ? p.nombre : producto.status === "not-found" ? "Producto no encontrado" : "Producto";

    return (
        <div className={styles.pagina}>
            <title>{`${pestana} · RED Suplementos`}</title>

            <section
                className={`${styles.escena} on-field`}
                aria-labelledby="producto-titulo"
                aria-busy={producto.status === "loading"}
                data-llegada={state?.sinTelon ? "transicion" : "carga"}
            >
                <div className={styles.cabecera}>
                    <nav aria-label="Ruta" className={styles.migas}>
                        <ol>
                            <li><Link to="/catalogo">Catálogo</Link></li>
                            {listo && categoria ? <li><Link to={`/catalogo?categoria=${p.idCategoria}`}>{categoria}</Link></li> : null}
                        </ol>
                    </nav>
                    {/* Un solo h1 durante toda la carga: el foco que deja el cambio de pantalla no se pierde. */}
                    <h1
                        id="producto-titulo"
                        className={producto.status === "loading" ? "visually-hidden" : styles.nombre}
                    >
                        {titulo}
                    </h1>
                </div>

                <div className={styles.panel} data-hover-placa>
                    {listo ? <ImagenProducto producto={p} categoria={categoria} /> : (
                        <div className={styles.inclinable}>
                            {producto.status === "loading" ? <Skeleton ratio="1" /> : (
                                <ProductoImagen producto={{ idProducto: 0, idCategoria: 0, nombre: "", marca: "", imagen: "" }} categoria="RED" />
                            )}
                        </div>
                    )}
                    {listo ? <BotonMovimiento className={styles.pausa} /> : null}
                </div>

                <div className={styles.ficha}>
                    {producto.status === "loading" ? (
                        <div className={styles.esqueleto} role="status">
                            <span className="visually-hidden">Cargando producto…</span>
                            <Skeleton width="40%" height="2.25rem" />
                            <Skeleton width="100%" height="64px" />
                            <Skeleton width="70%" height="1.1rem" />
                            <Skeleton width="90%" height="1.1rem" />
                        </div>
                    ) : null}

                    {producto.status === "not-found" ? (
                        <>
                            <p className={styles.descripcion}>Puede que se haya dado de baja o que el enlace esté mal escrito.</p>
                            <div className={styles.acciones}>
                                <Button to="/catalogo" variant="secondary" size="lg" fullWidth>Ver el catálogo</Button>
                                <Button href={urlMensajeDirecto()} variant="tonal" size="lg" fullWidth icon={<InstagramIcon size={20} />}>
                                    Preguntar por Instagram
                                </Button>
                            </div>
                        </>
                    ) : null}

                    {producto.status === "error" ? (
                        <>
                            <p className={styles.descripcion}>{mensajeDeError(producto.error)}</p>
                            <div>
                                <Button variant="secondary" onClick={producto.recargar}>Reintentar</Button>
                            </div>
                        </>
                    ) : null}

                    {listo ? (
                        <>
                            <div className={styles.precioFila}>
                                <p className={`${styles.precio} tabular`}>{formatPrecio(p.precio)}</p>
                                <StockBadge producto={p} />
                            </div>
                            <div ref={accionesRef} className={styles.acciones}>
                                <BotonComprar producto={p} size="lg" fullWidth />
                                <Button to={`/catalogo?categoria=${p.idCategoria}`} variant="tonal" size="lg" fullWidth>
                                    {categoria ? `Más de ${categoria}` : "Ver el catálogo"}
                                </Button>
                            </div>
                            <dl className={styles.datos}>
                                {p.marca ? (
                                    <div>
                                        <dt>Marca</dt>
                                        <dd>{p.marca}</dd>
                                    </div>
                                ) : null}
                                {p.sabor ? (
                                    <div>
                                        <dt>Sabor</dt>
                                        <dd>{p.sabor}</dd>
                                    </div>
                                ) : null}
                                {categoria ? (
                                    <div>
                                        <dt>Categoría</dt>
                                        <dd>{categoria}</dd>
                                    </div>
                                ) : null}
                            </dl>
                            {p.descripcion ? <p className={styles.descripcion}>{p.descripcion}</p> : null}
                            <p className={styles.estado} data-abierto={estadoLocal.abierto}>{estadoLocal.texto}</p>
                            <p className={styles.promo}>
                                {NEGOCIO.descuentoSocios} % de descuento para socios de {NEGOCIO.gimnasio} con membresía activa.
                            </p>
                        </>
                    ) : null}
                </div>
            </section>

            {listo ? (
                <>
                    <Marquesina frases={[categoria, p.marca, p.sabor, "Retirás en el mostrador", "Todo en suplementos"].filter(Boolean)} />

                    <section className={`${styles.pasos} on-field`} aria-labelledby="como-comprar">
                        <Revelar className={styles.pasosInterior}>
                            <div className={styles.pasosTexto}>
                                <h2 id="como-comprar" className={`${styles.pasosTitulo} reveal`}>Cómo se compra</h2>
                                <ol className={styles.lista}>
                                    {PASOS.map(({ verbo, texto }, indice) => (
                                        <li key={verbo} className={styles.paso}>
                                            <h3 className="display">
                                                <span className="linea"><span style={{ "--i": indice + 1 }}>{verbo}</span></span>
                                            </h3>
                                            <p className="reveal" style={{ "--i": indice + 2 }}>{texto}</p>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                            <figure className={styles.local}>
                                <div className={`${styles.localFoto} reveal-corte`}>
                                    <img
                                        src={fachada}
                                        width="760"
                                        height="950"
                                        alt={`Fachada de ${NEGOCIO.gimnasio}, con el cartel naranja: ahí se retira el pedido.`}
                                        loading="lazy"
                                        decoding="async"
                                    />
                                </div>
                                <figcaption className={styles.localPie}>{NEGOCIO.gimnasio}, {NEGOCIO.direccion}, {NEGOCIO.localidad}.</figcaption>
                            </figure>
                        </Revelar>
                    </section>

                    <section className={styles.relacionados} aria-labelledby="seguir-mirando">
                        <Revelar className={styles.relacionadosEncabezado}>
                            <h2 id="seguir-mirando" className="display">
                                <span className="linea"><span>Seguí mirando</span></span>
                            </h2>
                            <Link to="/catalogo" className={`${styles.verTodo} reveal`} style={{ "--i": 1 }}>
                                Ver todo el catálogo
                                <ArrowRight size={20} aria-hidden="true" />
                            </Link>
                        </Revelar>
                        <Revelar className={styles.grilla}>
                            <figure className={`${styles.stock} reveal`}>
                                <div className={styles.stockFoto}>
                                    <img
                                        src={stockGrande}
                                        srcSet={`${stockChica} 440w, ${stockGrande} 660w`}
                                        sizes="(min-width: 960px) 24vw, (min-width: 560px) 48vw, 100vw"
                                        width="660"
                                        height="825"
                                        alt="Suplementos de la tienda apilados sobre discos de pesas."
                                        loading="lazy"
                                        decoding="async"
                                    />
                                </div>
                                <figcaption className={styles.stockPie}>Parte del stock de la tienda, sobre los discos del gimnasio.</figcaption>
                            </figure>
                            {relacionados.map((otro, indice) => (
                                <ProductoCard
                                    key={otro.idProducto}
                                    className="reveal"
                                    style={{ "--i": indice + 1 }}
                                    producto={otro}
                                    categoria={categorias.status === "success" ? nombreCategoria(categorias.mapaCategorias, otro.idCategoria) : ""}
                                />
                            ))}
                        </Revelar>
                    </section>

                    <BarraCompra producto={p} visible={barraVisible} />
                </>
            ) : null}
        </div>
    );
}

// Componente propio para que la inclinación se enganche cuando la imagen ya existe.
function ImagenProducto({ producto, categoria }) {
    const ref = useInclinacion();
    return (
        <div ref={ref} className={styles.inclinable} style={{ viewTransitionName: "producto-activo" }}>
            <ProductoImagen key={producto.imagen} producto={producto} categoria={categoria} prioridad />
        </div>
    );
}

// Al bajar, el precio y «Comprar» quedan a mano: la barra baja desde abajo de la barra principal.
// Oculta, queda fuera del foco y del lector (inert).
function BarraCompra({ producto, visible }) {
    return (
        <div className={`${styles.barraCompra} on-field`} data-barra-compra={visible ? "visible" : "oculta"} inert={!visible}>
            <div className={styles.barraInterior}>
                <p className={styles.barraNombre}>{producto.nombre}</p>
                <p className={`${styles.barraPrecio} tabular`}>{formatPrecio(producto.precio)}</p>
                <BotonComprar producto={producto} />
            </div>
        </div>
    );
}
