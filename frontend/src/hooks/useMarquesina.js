import { useEffect, useRef } from "react";

// La marquesina responde al scroll: acelera y se inclina hasta los 7° del logo, y vuelve a su ritmo.
// Escribe directo en la pista y actualiza la animación CSS sin reiniciarla.
export function useMarquesina() {
    const ref = useRef(null);

    useEffect(() => {
        const pista = ref.current;
        if (!pista || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

        let ultimaY = window.scrollY;
        let velocidad = 0;
        let cuadro = null;
        let visible = false;
        let ritmo = 1;

        function paso() {
            const y = window.scrollY;
            velocidad += (y - ultimaY - velocidad) * 0.12;
            ultimaY = y;

            const inclinacion = Math.max(-7, Math.min(7, velocidad * 0.35));
            pista.style.transform = `skewX(${-inclinacion}deg)`;

            const nuevoRitmo = 1 + Math.min(Math.abs(velocidad) * 0.12, 5);
            if (Math.abs(nuevoRitmo - ritmo) > 0.02) {
                ritmo = nuevoRitmo;
                pista.getAnimations()[0]?.updatePlaybackRate(ritmo);
            }

            cuadro = visible || Math.abs(velocidad) > 0.05 ? requestAnimationFrame(paso) : null;
        }

        const observer = new IntersectionObserver(([entrada]) => {
            visible = entrada.isIntersecting;
            if (visible && cuadro === null) {
                ultimaY = window.scrollY;
                cuadro = requestAnimationFrame(paso);
            }
        });
        observer.observe(pista);

        return () => {
            observer.disconnect();
            if (cuadro !== null) cancelAnimationFrame(cuadro);
        };
    }, []);

    return ref;
}
