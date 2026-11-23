import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import styles from "./EncabezadoPanel.module.css";

const VOLVER_A_PRODUCTOS = { destino: "/admin/productos", texto: "Productos" };

// Encabezado de las pantallas del panel: volver (opcional), título, estado y acción principal.
// "volver" es true (a Productos) o { destino, texto }; "estado" va junto al título, como un badge.
export default function EncabezadoPanel({ titulo, tituloRef, volver = false, estado, accion, children }) {
    const destinoVolver = volver === true ? VOLVER_A_PRODUCTOS : volver;
    return (
        <header className={styles.encabezado}>
            {destinoVolver ? (
                <Link to={destinoVolver.destino} className={styles.volver}>
                    <ArrowLeft size={18} aria-hidden="true" />
                    {destinoVolver.texto}
                </Link>
            ) : null}
            <div className={styles.fila}>
                <div className={styles.tituloConEstado}>
                    <h1 ref={tituloRef} tabIndex={-1} className={styles.titulo}>{titulo}</h1>
                    {estado}
                </div>
                {accion}
            </div>
            {children}
        </header>
    );
}
