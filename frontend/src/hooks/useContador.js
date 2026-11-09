import { useEffect, useRef } from "react";

// Cuenta hasta la cifra una sola vez, al entrar en pantalla. El número final ya está en el HTML:
// sin movimiento, o si algo falla, se ve la cifra correcta.
export function useContador(final, duracionMs = 900) {
    const ref = useRef(null);

    useEffect(() => {
        const elemento = ref.current;
        if (!elemento || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

        let cuadro = null;
        const observer = new IntersectionObserver(([entrada]) => {
            if (!entrada.isIntersecting) return;
            observer.disconnect();
            const inicio = performance.now();
            function paso(ahora) {
                const avance = Math.min((ahora - inicio) / duracionMs, 1);
                // Sale rápido y frena al llegar.
                elemento.textContent = String(Math.round(final * (1 - (1 - avance) ** 3)));
                if (avance < 1) cuadro = requestAnimationFrame(paso);
            }
            cuadro = requestAnimationFrame(paso);
        }, { rootMargin: "0px 0px -15% 0px" });
        observer.observe(elemento);

        return () => {
            observer.disconnect();
            if (cuadro !== null) cancelAnimationFrame(cuadro);
            elemento.textContent = String(final);
        };
    }, [final, duracionMs]);

    return ref;
}
