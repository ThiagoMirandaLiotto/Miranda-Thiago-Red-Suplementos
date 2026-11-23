import styles from "./EncabezadoPublico.module.css";

// Cabecera negra de las páginas internas del sitio: continúa la barra y baja con un borde a 7°.
// "lineas" son los renglones del título, cortados a mano (nunca más de dos).
export default function EncabezadoPublico({ lineas, bajada, children, id }) {
    return (
        <header className={`${styles.encabezado} on-field`}>
            <h1 id={id} className="display linea-carga">
                {lineas.map((linea, indice) => (
                    <span key={linea} className="linea">
                        <span style={indice ? { "--i": indice } : undefined}>{linea}</span>
                    </span>
                ))}
            </h1>
            {bajada ? <p className={styles.bajada}>{bajada}</p> : null}
            {children}
        </header>
    );
}
