import { useReveal } from "../../hooks/useReveal.js";

// Bloque cuyas partes entran en orden al aparecer en pantalla.
// Cada bloque de una sección largo tiene el suyo: si no, lo de abajo entraría sin que nadie lo vea.
export default function Revelar({ className = "", children }) {
    const ref = useReveal();
    return <div ref={ref} className={className}>{children}</div>;
}
