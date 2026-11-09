import styles from "./Badge.module.css";

// Estado con texto e ícono: el color nunca es la única señal.
export default function Badge({ tono = "neutral", icon, children }) {
    return (
        <span className={styles.badge} data-tono={tono}>
            {icon}
            <span>{children}</span>
        </span>
    );
}
