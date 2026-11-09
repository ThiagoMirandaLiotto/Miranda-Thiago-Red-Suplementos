import { useEffect } from "react";

// Barra del sitio público: queda siempre fija arriba. Sobre el hero es transparente
// y se vuelve sólida apenas se baja.
// Escribe en el DOM y no en el estado: el scroll no debe volver a renderizar la barra.
export function useBarraScroll(ref, { transparenteArriba }) {
    useEffect(() => {
        const barra = ref.current;
        if (!barra) return undefined;

        let pendiente = false;

        function actualizar() {
            pendiente = false;
            barra.dataset.fondo = transparenteArriba && window.scrollY < 24 ? "transparente" : "solido";
        }

        function alHacerScroll() {
            if (pendiente) return;
            pendiente = true;
            requestAnimationFrame(actualizar);
        }

        actualizar();
        window.addEventListener("scroll", alHacerScroll, { passive: true });
        return () => window.removeEventListener("scroll", alHacerScroll);
    }, [ref, transparenteArriba]);
}
