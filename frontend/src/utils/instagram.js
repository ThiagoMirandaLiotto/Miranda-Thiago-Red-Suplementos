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

// Si quien escribe tiene cuenta, el mensaje incluye su email: el local registra el pedido a su nombre
// y lo sigue desde «Mi cuenta» (con el 10 % si es socio verificado).
function firmaCuenta(cuenta) {
    return cuenta ? ` Tengo cuenta en la página con ${cuenta.email}.` : "";
}

export function mensajeConsulta(producto, cuenta = null) {
    if (producto.stock === 0) {
        return `Hola, ${NEGOCIO.nombre}. ¿Cuándo vuelven a tener ${describirProducto(producto)}?${firmaCuenta(cuenta)}`;
    }
    return `Hola, ${NEGOCIO.nombre}. Quiero comprar ${describirProducto(producto)}. ¿Lo puedo retirar en el local?${firmaCuenta(cuenta)}`;
}

// F-07: repetir una compra desde «Mi cuenta». El pedido nuevo lo registra el local, como siempre.
export function mensajeRepetir(pedido, cuenta = null) {
    const productos = pedido.detalles.map((detalle) => `${detalle.cantidad} × ${detalle.nombre}`).join(", ");
    return `Hola, ${NEGOCIO.nombre}. Quiero repetir mi pedido ${pedido.codigo}: ${productos}. ¿Cuándo lo puedo retirar?${firmaCuenta(cuenta)}`;
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
