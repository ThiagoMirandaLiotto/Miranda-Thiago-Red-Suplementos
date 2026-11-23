import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import styles from "./CampoCantidad.module.css";

// Cantidad con − y +, o escrita y confirmada con Enter o al salir del campo.
// No guarda nada por su cuenta: avisa el número nuevo y muestra el que confirmó la API.
export default function CampoCantidad({ valor, max, onCambiar, etiqueta, deshabilitado = false }) {
    const [borrador, setBorrador] = useState(null);

    function confirmar() {
        if (borrador === null) return;
        const numero = Number(borrador);
        setBorrador(null);
        if (/^\d+$/.test(borrador) && numero >= 1 && numero !== valor) onCambiar(numero);
    }

    return (
        <div className={styles.campo} role="group" aria-label={etiqueta}>
            <button
                type="button"
                className={styles.boton}
                onClick={() => onCambiar(valor - 1)}
                disabled={deshabilitado || valor <= 1}
                aria-label="Restar una unidad"
            >
                <Minus size={16} aria-hidden="true" />
            </button>
            <input
                className={`${styles.numero} tabular`}
                inputMode="numeric"
                value={borrador ?? String(valor)}
                onChange={(event) => setBorrador(event.target.value.replace(/\D/g, ""))}
                onBlur={confirmar}
                onKeyDown={(event) => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        confirmar();
                    }
                }}
                disabled={deshabilitado}
                aria-label="Cantidad"
            />
            <button
                type="button"
                className={styles.boton}
                onClick={() => onCambiar(valor + 1)}
                disabled={deshabilitado || (max !== undefined && valor >= max)}
                aria-label="Sumar una unidad"
            >
                <Plus size={16} aria-hidden="true" />
            </button>
        </div>
    );
}
