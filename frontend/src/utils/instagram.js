import { INSTAGRAM, NEGOCIO } from "./constants.js";
import { formatPrecio } from "./formatters.js";

export function urlPerfil(usuario) {
    return `https://www.instagram.com/${usuario}/`;
}

// Abre el chat de mensajes directos. Instagram no permite dejar
// el texto escrito: por eso la consulta se copia antes.
export function urlMensajeDirecto(usuario = INSTAGRAM.tienda.usuario) {
    return `https://ig.me/m/${usuario}`;
}

function describirProducto({ nombre, marca, sabor, precio }) {
    const detalles = [marca, sabor].filter(Boolean).join(", ");
    return `${nombre}${detalles ? ` (${detalles})` : ""}, a ${formatPrecio(precio)}`;
}

export function mensajeConsulta(producto) {
    if (producto.stock === 0) {
        return `Hola, ${NEGOCIO.nombre}. ¿Cuándo vuelven a tener ${describirProducto(producto)}?`;
    }
    return `Hola, ${NEGOCIO.nombre}. Quiero comprar ${describirProducto(producto)}. ¿Lo puedo retirar en el local?`;
}

// Devuelve false si el navegador no deja copiar (por ejemplo, en un contexto inseguro).
export async function copiarAlPortapapeles(texto) {
    try {
        await navigator.clipboard.writeText(texto);
        return true;
    } catch {
        return false;
    }
}
