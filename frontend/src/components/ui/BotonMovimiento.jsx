import { Pause, Play } from "lucide-react";
import { alternarPausa, useMovimientoPausado, useMovimientoReducido } from "../../hooks/useMovimiento.js";
import styles from "./BotonMovimiento.module.css";

// Lo que se mueve solo más de 5 segundos necesita una forma de pararlo (WCAG 2.2.2).
// Con movimiento reducido no hay nada que pausar.
export default function BotonMovimiento({ className = "" }) {
    const pausado = useMovimientoPausado();
    const reducido = useMovimientoReducido();
    if (reducido) return null;

    const Icono = pausado ? Play : Pause;
    return (
        <button
            type="button"
            className={`${styles.boton} ${className}`}
            aria-pressed={pausado}
            aria-label="Pausar animaciones"
            title={pausado ? "Reanudar animaciones" : "Pausar animaciones"}
            onClick={alternarPausa}
        >
            <Icono size={18} aria-hidden="true" />
        </button>
    );
}
