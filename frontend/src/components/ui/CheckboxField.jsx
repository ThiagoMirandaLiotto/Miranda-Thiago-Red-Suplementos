import { useId } from "react";
import styles from "./CheckboxField.module.css";

export default function CheckboxField({ label, hint, ...props }) {
    const id = useId();
    return (
        <div className={styles.campo}>
            <input id={id} type="checkbox" className={styles.casilla} aria-describedby={hint ? `${id}-ayuda` : undefined} {...props} />
            <label htmlFor={id} className={styles.label}>{label}</label>
            {hint ? <p id={`${id}-ayuda`} className={styles.ayuda}>{hint}</p> : null}
        </div>
    );
}
