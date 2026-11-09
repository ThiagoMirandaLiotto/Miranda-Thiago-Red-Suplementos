import { useEffect, useState } from "react";
import { useMovimientoPausado, useMovimientoReducido } from "./useMovimiento.js";

// Avanza entre las fotos del hero. No corre con movimiento reducido, en pausa,
// fuera de pantalla ni con la pestaña oculta.
export function useRotacion(ref, cantidad, intervaloMs = 6000) {
    const [estado, setEstado] = useState({ activa: 0, previa: null });
    const pausado = useMovimientoPausado();
    const reducido = useMovimientoReducido();

    useEffect(() => {
        const elemento = ref.current;
        if (!elemento || pausado || reducido || cantidad < 2) return undefined;

        let visible = true;
        const observer = new IntersectionObserver(([entrada]) => {
            visible = entrada.isIntersecting;
        });
        observer.observe(elemento);

        const intervalo = setInterval(() => {
            if (!visible || document.hidden) return;
            setEstado(({ activa }) => ({ activa: (activa + 1) % cantidad, previa: activa }));
        }, intervaloMs);

        return () => {
            clearInterval(intervalo);
            observer.disconnect();
        };
    }, [ref, cantidad, intervaloMs, pausado, reducido]);

    return estado;
}
