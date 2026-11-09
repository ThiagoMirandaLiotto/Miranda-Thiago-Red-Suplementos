import styles from "./Spinner.module.css";

// Decorativo: el texto del botón o del estado es el que anuncia la carga.
export default function Spinner({ size = 18 }) {
    return (
        <svg className={styles.spinner} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
            <circle className={styles.pista} cx="12" cy="12" r="9" />
            <path className={styles.arco} d="M21 12a9 9 0 0 0-9-9" />
        </svg>
    );
}
