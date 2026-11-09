import styles from "./States.module.css";

export default function EmptyState({ icon, titulo, children, accion, as: Titulo = "h2" }) {
    return (
        <div className={styles.estado}>
            {icon ? <div className={styles.icono} aria-hidden="true">{icon}</div> : null}
            <Titulo className={styles.titulo}>{titulo}</Titulo>
            {children ? <div className={styles.texto}>{children}</div> : null}
            {accion ? <div className={styles.accion}>{accion}</div> : null}
        </div>
    );
}
