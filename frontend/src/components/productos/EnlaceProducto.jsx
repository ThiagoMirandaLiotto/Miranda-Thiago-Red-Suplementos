import { flushSync } from "react-dom";
import { Link, useNavigate } from "react-router";

// Enlace a la página de un producto. Viaja con los datos que ya tiene la tarjeta, así la ficha
// aparece al instante, y donde el navegador lo permite la imagen de la tarjeta se transforma en
// la de la página (View Transitions). Sin soporte, con movimiento reducido o abriendo en otra
// pestaña, es un enlace común.
export default function EnlaceProducto({ producto, categoria, children, ref, ...props }) {
    const navigate = useNavigate();
    const destino = `/catalogo/${producto.idProducto}`;

    function alHacerClic(event) {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (!document.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        event.preventDefault();
        const imagen = event.currentTarget.closest("article")?.querySelector("[data-vt-imagen]");
        if (imagen) imagen.style.viewTransitionName = "producto-activo";

        const transicion = document.startViewTransition(() => {
            flushSync(() => navigate(destino, { state: { producto, categoria, sinTelon: true } }));
            window.scrollTo({ top: 0, behavior: "instant" });
        });
        transicion.finished.finally(() => {
            if (imagen) imagen.style.viewTransitionName = "";
        });
    }

    return (
        <Link ref={ref} to={destino} state={{ producto, categoria }} onClick={alHacerClic} {...props}>
            {children}
        </Link>
    );
}
