import { useEffect, useRef } from "react";
import { useLocation } from "react-router";

// Al cambiar de pantalla: lleva el scroll arriba (o al ancla pedida) y mueve el foco
// al título principal, para que el lector de pantalla anuncie dónde está la persona.
// No actúa en la primera carga sin ancla ni cuando solo cambia la query: los filtros
// viven en la URL, y mover el foco interrumpiría a quien está escribiendo en la búsqueda.
export default function RouteFocus() {
    const { key, pathname, search, hash } = useLocation();
    const anterior = useRef({ key, pathname, search });

    useEffect(() => {
        const previa = anterior.current;
        anterior.current = { key, pathname, search };

        const esPrimeraCarga = previa.key === key;
        const soloCambiaronFiltros = previa.pathname === pathname && previa.search !== search;
        if (!hash && (esPrimeraCarga || soloCambiaronFiltros)) return;

        const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (hash) {
            const destino = document.getElementById(decodeURIComponent(hash.slice(1)));
            if (destino) {
                destino.scrollIntoView({ behavior: suave ? "smooth" : "auto", block: "start" });
                enfocar(destino.querySelector("h2, h1") ?? destino);
                return;
            }
        }
        window.scrollTo({ top: 0, behavior: "auto" });
        enfocar(document.querySelector("main h1"));
    }, [key, pathname, search, hash]);

    return null;
}

function enfocar(elemento) {
    if (!elemento) return;
    if (!elemento.hasAttribute("tabindex")) elemento.setAttribute("tabindex", "-1");
    elemento.focus({ preventScroll: true });
}
