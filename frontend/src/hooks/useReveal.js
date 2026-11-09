import { useLayoutEffect, useRef } from "react";

// Entrada escalonada de las partes de una sección la primera vez que aparece en pantalla.
// Los elementos con la clase "reveal" y la variable --i entran en orden (ver styles/global.css).
// Sin IntersectionObserver el contenido nunca se oculta.
export function useReveal() {
    const ref = useRef(null);

    useLayoutEffect(() => {
        const seccion = ref.current;
        if (!seccion || !("IntersectionObserver" in window)) return undefined;

        seccion.dataset.reveal = "pendiente";
        const observer = new IntersectionObserver((entradas) => {
            if (entradas.some((entrada) => entrada.isIntersecting)) {
                seccion.dataset.reveal = "visible";
                observer.disconnect();
            }
        }, { rootMargin: "0px 0px -12% 0px" });
        observer.observe(seccion);

        return () => {
            observer.disconnect();
            seccion.dataset.reveal = "visible";
        };
    }, []);

    return ref;
}
