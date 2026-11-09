import { CircleAlert } from "lucide-react";
import styles from "./Field.module.css";

// Estructura común de los campos: label asociado, ayuda, contador y error.
// Los ids los genera cada campo con useId y llegan acá para enlazar aria-describedby.
export default function FieldShell({ id, label, required, hint, error, contador, children }) {
    return (
        <div className={styles.field} data-invalid={error ? "true" : undefined}>
            <div className={styles.encabezado}>
                <label htmlFor={id} className={styles.label}>
                    {label}
                    {required ? <span className={styles.requerido}> (obligatorio)</span> : null}
                </label>
                {contador ? <span className={styles.contador} aria-hidden="true">{contador}</span> : null}
            </div>
            {children}
            {hint ? <p id={`${id}-ayuda`} className={styles.ayuda}>{hint}</p> : null}
            {error ? (
                <p id={`${id}-error`} className={styles.error}>
                    <CircleAlert size={16} aria-hidden="true" />
                    <span>{error}</span>
                </p>
            ) : null}
        </div>
    );
}
