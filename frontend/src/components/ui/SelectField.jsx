import { useId } from "react";
import { ChevronDown } from "lucide-react";
import FieldShell from "./FieldShell.jsx";
import { describedBy } from "../../utils/aria.js";
import styles from "./Field.module.css";

// options: [{ valor, etiqueta }]. "placeholder" agrega una primera opción vacía.
export default function SelectField({ label, required, hint, error, options, placeholder, ...props }) {
    const id = useId();
    return (
        <FieldShell id={id} label={label} required={required} hint={hint} error={error}>
            <div className={styles.selectWrap}>
                <select
                    id={id}
                    className={styles.control}
                    aria-required={required || undefined}
                    aria-invalid={error ? "true" : undefined}
                    aria-describedby={describedBy(id, { hint, error })}
                    {...props}
                >
                    {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
                    {options.map((opcion) => (
                        <option key={opcion.valor} value={opcion.valor}>{opcion.etiqueta}</option>
                    ))}
                </select>
                <ChevronDown size={20} aria-hidden="true" />
            </div>
        </FieldShell>
    );
}
