import { useId } from "react";
import FieldShell from "./FieldShell.jsx";
import { describedBy } from "../../utils/aria.js";
import styles from "./Field.module.css";

export default function TextField({ label, required, hint, error, contador, ...props }) {
    const id = useId();
    return (
        <FieldShell id={id} label={label} required={required} hint={hint} error={error} contador={contador}>
            <input
                id={id}
                className={styles.control}
                aria-required={required || undefined}
                aria-invalid={error ? "true" : undefined}
                aria-describedby={describedBy(id, { hint, error })}
                {...props}
            />
        </FieldShell>
    );
}
