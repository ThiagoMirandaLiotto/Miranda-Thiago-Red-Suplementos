import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import styles from "./EncabezadoPanel.module.css";

// Encabezado de las pantallas del panel: volver (opcional), título y acción principal.
export default function EncabezadoPanel({ titulo, tituloRef, volver = false, accion, children }) {
    return (
        <header className={styles.encabezado}>
            {volver ? (
                <Link to="/admin/productos" className={styles.volver}>
                    <ArrowLeft size={18} aria-hidden="true" />
                    Productos
                </Link>
            ) : null}
            <div className={styles.fila}>
                <h1 ref={tituloRef} tabIndex={-1} className={styles.titulo}>{titulo}</h1>
                {accion}
            </div>
            {children}
        </header>
    );
}
